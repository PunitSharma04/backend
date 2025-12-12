export const extractPublicId = (url) => {
  if (!url) return null;

  const parts = url.split("/");
  const fileWithExtension = parts.pop(); // abcd1234.png
  const folder = parts.pop(); // folder
  const fileName = fileWithExtension.split(".")[0]; // abcd1234

  return `${folder}/${fileName}`;
};
