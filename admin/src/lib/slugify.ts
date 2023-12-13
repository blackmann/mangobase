function slugify(text: string, mangle = false) {
  let slug = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')

  if (mangle) {
    slug += `-${Math.random().toString(36).substring(2, 7)}`
  }

  return slug
}

export { slugify }
