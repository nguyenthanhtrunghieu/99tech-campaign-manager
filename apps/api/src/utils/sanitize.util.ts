import sanitizeHtml from 'sanitize-html';

export const sanitizeHtmlContent = (html: string): string => {
  return sanitizeHtml(html, {
    allowedTags: [
      'b', 'i', 'em', 'strong', 'a', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'ul', 'ol', 'li', 'br', 'div', 'span', 'blockquote'
    ],
    allowedAttributes: {
      'a': ['href', 'name', 'target', 'title', 'rel'],
      'img': ['src', 'alt', 'title', 'width', 'height', 'loading'],
      '*': ['class', 'id']
    },
    transformTags: {
      'a': (tagName, attribs) => {
        return {
          tagName: 'a',
          attribs: {
            ...attribs,
            target: '_blank',
            rel: 'noopener noreferrer'
          }
        };
      }
    },
    // Strictly strip out script, iframe, object, etc.
    disallowedTagsMode: 'discard',
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: {
      'a': ['http', 'https', 'mailto', 'tel'],
      'img': ['http', 'https', 'data']
    },
    allowProtocolRelative: false,
    // Filter out all attributes starting with 'on'
    exclusiveFilter: (frame) => {
      // sanitize-html automatically handles most 'on*' attributes if not allowed,
      // but we can be explicit if needed. However, the default behavior of 
      // allowedAttributes already excludes them since they are not in the list.
      return false;
    }
  });
};
