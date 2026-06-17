export const productsQuery = `*[_type == "product" && active == true] | order(sortOrder asc, name asc) {
  _id,
  name,
  "slug": slug.current,
  tagline,
  description,
  category,
  badge,
  image,
  storageOptions,
  colors,
  features,
  seoTitle,
  seoDescription
}`;

export const productBySlugQuery = `*[_type == "product" && slug.current == $slug][0] {
  _id,
  name,
  "slug": slug.current,
  tagline,
  description,
  category,
  badge,
  image,
  storageOptions,
  colors,
  features,
  seoTitle,
  seoDescription
}`;

export const blindBoxPrizesQuery = `*[_type == "blindBoxPrize" && active == true] | order(sortOrder asc) {
  _id,
  name,
  prizeType,
  weight,
  emoji,
  image
}`;

export const blindBoxConfigQuery = `*[_type == "blindBoxConfig"][0] {
  price,
  enabled,
  grandPrizeName,
  grandPrizeValue,
  heroTitle,
  heroSubtitle,
  grandPrizeImage,
  seoTitle,
  seoDescription,
  dailyLimit
}`;

export const siteSettingsQuery = `*[_type == "siteSettings"][0] {
  siteName,
  homeSeoTitle,
  homeSeoDescription,
  ogImage,
  supportPhone,
  supportEmail
}`;
