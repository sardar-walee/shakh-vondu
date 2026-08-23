import {
  Firestore,
  collection,
  getDocs,
  deleteDoc,
  doc
} from 'firebase/firestore';

export interface DemoCleanerOptions {
  /**
   * Specific collections to scan and clean.
   * Defaults to all primary app collections if omitted.
   */
  collections?: string[];

  /**
   * If true, performs a dry run scan without actually deleting documents from Firestore.
   */
  dryRun?: boolean;

  /**
   * Custom custom tag patterns to match against doc tags or metaTags array.
   */
  customDemoTags?: string[];
}

export interface DemoCleanerResult {
  success: boolean;
  dryRun: boolean;
  totalScanned: number;
  totalDeleted: number;
  deletedByCollection: Record<string, number>;
  details: string;
  deletedDocIds: Record<string, string[]>;
}

const DEFAULT_DEMO_TAGS = ['demo', 'test', 'mock', 'sample', 'seed', 'test-data', 'demo-data'];

/**
 * Helper function to determine if a Firestore document is tagged or identified as a Demo/Test record.
 * Checks ID prefixes, boolean flags, metaTags arrays, string tags, and email/title patterns.
 */
export function isDemoOrTestDocument(
  docId: string,
  data: Record<string, any>,
  customTags: string[] = []
): boolean {
  if (!data) return false;

  const idLower = docId.toLowerCase();
  const searchTags = [...DEFAULT_DEMO_TAGS, ...customTags.map((t) => t.toLowerCase())];

  // 1. Check Document ID prefixes & patterns
  if (
    idLower.startsWith('demo-') ||
    idLower.startsWith('test-') ||
    idLower.startsWith('mock-') ||
    idLower.startsWith('seed-') ||
    idLower.startsWith('sample-')
  ) {
    return true;
  }

  // 2. Check explicit Boolean flags
  if (
    data.isDemo === true ||
    data.isTest === true ||
    data.isMock === true ||
    data.isSample === true ||
    data.isSampleData === true ||
    data.isDemoData === true
  ) {
    return true;
  }

  // 3. Check single String tag / environment / type / category
  const singleTagFields = [data.tag, data.environment, data.env, data.metaTag, data.type, data.category];
  for (const val of singleTagFields) {
    if (typeof val === 'string') {
      const valLower = val.toLowerCase().trim();
      if (searchTags.includes(valLower)) {
        return true;
      }
    }
  }

  // 4. Check Array fields (tags, metaTags, labels)
  const arrayFields = [data.tags, data.metaTags, data.labels, data.categories];
  for (const arr of arrayFields) {
    if (Array.isArray(arr)) {
      const hasMatch = arr.some(
        (item) => typeof item === 'string' && searchTags.includes(item.toLowerCase().trim())
      );
      if (hasMatch) return true;
    }
  }

  // 5. Check text metadata (title, name, email) for explicit [DEMO] or [TEST] bracket tags
  const textFields = [data.title, data.name, data.fullName, data.storeName, data.email];
  for (const text of textFields) {
    if (typeof text === 'string') {
      const textLower = text.toLowerCase();
      if (
        textLower.includes('[demo]') ||
        textLower.includes('[test]') ||
        textLower.includes('(demo)') ||
        textLower.includes('(test)') ||
        textLower.endsWith('@example.com')
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Secure Utility: Identifies and deletes all documents from Firestore collections tagged with 'demo' or 'test' meta-tags.
 * Leaves live user, seller, product, and order data intact.
 */
export async function cleanTaggedDemoRecords(
  db: Firestore,
  options: DemoCleanerOptions = {}
): Promise<DemoCleanerResult> {
  const targetCollections = options.collections || [
    'products',
    'sellers',
    'cars',
    'orders',
    'reviews',
    'feedbacks',
    'notifications',
    'favorites',
    'wallets',
    'agreements',
    'users'
  ];

  const dryRun = options.dryRun ?? false;
  const customTags = options.customDemoTags || [];

  let totalScanned = 0;
  let totalDeleted = 0;
  const deletedByCollection: Record<string, number> = {};
  const deletedDocIds: Record<string, string[]> = {};

  try {
    for (const colName of targetCollections) {
      deletedByCollection[colName] = 0;
      deletedDocIds[colName] = [];

      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);

      const docsToDelete: { id: string; ref: ReturnType<typeof doc> }[] = [];

      for (const docSnap of snapshot.docs) {
        totalScanned++;
        const docId = docSnap.id;
        const data = docSnap.data();

        if (isDemoOrTestDocument(docId, data, customTags)) {
          docsToDelete.push({
            id: docId,
            ref: doc(db, colName, docId)
          });
        }
      }

      if (!dryRun) {
        const deletePromises = docsToDelete.map((item) => deleteDoc(item.ref));
        await Promise.all(deletePromises);
      }

      const count = docsToDelete.length;
      totalDeleted += count;
      deletedByCollection[colName] = count;
      deletedDocIds[colName] = docsToDelete.map((d) => d.id);
    }

    const actionText = dryRun ? 'دەستنیشانکران (Dry Run)' : 'بەسەرکەوتوویی سڕانەوە';
    const details = `پاککردنەوەی داتای دیمۆ و تست: لێکۆڵینەوە لە ${totalScanned} بەڵگەنامە کرا، لەوانە ${totalDeleted} بەڵگەنامەی دیمۆ/تست ${actionText}. داتای ڕاستەقینەی بەکارهێنەران بە تەواوی پارێزراون.`;

    return {
      success: true,
      dryRun,
      totalScanned,
      totalDeleted,
      deletedByCollection,
      details,
      deletedDocIds
    };
  } catch (error: any) {
    console.error('Error during Firestore demo/test record cleanup:', error);
    return {
      success: false,
      dryRun,
      totalScanned,
      totalDeleted,
      deletedByCollection,
      details: `هەڵەیەک ڕوویدا لە کاتی سڕینەوەی داتای دیمۆدا: ${error.message || 'هەڵەی نەزانراو'}`,
      deletedDocIds
    };
  }
}
