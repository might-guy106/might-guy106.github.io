import { BLOG_PATH, NOTES_PATH, RECIPES_PATH } from "@/content.config";
import { slugifyStr } from "./slugify";

/**
 * Get full path of a content entry
 * @param id - id of the content entry (aka slug)
 * @param filePath - the content entry full file location
 * @param includeBase - whether to include base path (e.g., `/posts`, `/notes`, `/recipes`) in return value
 * @returns content entry path
 */
export function getPath(
  id: string,
  filePath: string | undefined,
  includeBase = true
) {
  // Determine the collection type and base path from filePath
  let collectionPath = BLOG_PATH;
  let basePath = "/posts";

  if (filePath?.includes(NOTES_PATH)) {
    collectionPath = NOTES_PATH;
    basePath = "/notes";
  } else if (filePath?.includes(RECIPES_PATH)) {
    collectionPath = RECIPES_PATH;
    basePath = "/recipes";
  }

  const pathSegments = filePath
    ?.replace(collectionPath, "")
    .split("/")
    .filter(path => path !== "") // remove empty string in the segments ["", "other-path"] <- empty string will be removed
    .filter(path => !path.startsWith("_")) // exclude directories start with underscore "_"
    .slice(0, -1) // remove the last segment_ file name_ since it's unnecessary
    .map(segment => slugifyStr(segment)); // slugify each segment path

  const finalBasePath = includeBase ? basePath : "";

  // Making sure `id` does not contain the directory
  const contentId = id.split("/");
  const slug = contentId.length > 0 ? contentId.slice(-1) : contentId;

  // If not inside the sub-dir, simply return the file path
  if (!pathSegments || pathSegments.length < 1) {
    return [finalBasePath, slug].join("/");
  }

  return [finalBasePath, ...pathSegments, slug].join("/");
}
