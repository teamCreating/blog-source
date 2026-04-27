'use strict'

hexo.extend.filter.register(
  'after_post_render',
  function (data) {
    var theme = hexo.theme.config
    if (theme.lazyload.open!==true) return;

    data.content = data.content.replace(
      // Match 'img' tags width the src attribute.
      /<img([^>]*)src="([^"]*)"([^>]*)>/gim,
      function (match, attrBegin, src, attrEnd) {
        // Exit if the src doesn't exists.
        if (!src) {
          return match
        }

        // Keep a real src for RSS readers and clients that do not execute
        // the theme's lazyload script, while still exposing data-src for the
        // existing frontend behavior.
        return `
        <span class="lazyload-img-span">
        <img ${attrBegin} src="${src}" data-src="${src}"${attrEnd}>
        </span>
      `
      }
    )
  },
  1
)
