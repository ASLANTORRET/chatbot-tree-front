/* global ga, $, localStorage */
$(document).on('emoji:ready', function () {
  var hasFont = hasAppleColorEmoji()
  $('.input-search').focus()
  $('.loading').remove()

  if (!hasFont) {
    prepareTwemoji()
  }

  $(document).on('click', '.js-emoji', function (evt) {
    var node
    var text

    if (evt.shiftKey) {
      getSelection().removeAllRanges()
      var range = document.createRange()
      node = this.querySelector('.js-emoji-char')
      range.selectNodeContents(node)
      getSelection().addRange(range)

      text = hasFont ? node.textContent : node.querySelector('img').alt
    } else {
      node = this.querySelector('.js-emoji-code')
      node.select()
      text = node.value
    }
    // $('#emojiModal').modal('hide');
    //document.execCommand('copy');
    insertAtCaret(window.fieldId, text);
    console.log("window value: " + window.fieldId);
    alertCopied(text);
  })
})

function prepareTwemoji () {
  var twemojiScript = document.createElement('script')
  twemojiScript.src = '//twemoji.maxcdn.com/2/twemoji.min.js?2.2.3'
  twemojiScript.onload = function () {
    twemoji.parse(document.body)
    document.body.classList.add('twemojified')
  }
  document.head.appendChild(twemojiScript)
}

function alertCopied (emoji) {
  $('<div class=alert></div>').text('Inserted ' + emoji).appendTo('body').fadeIn().delay(1000).fadeOut()
}

function focusOnSearch (e) {
  var searchField = $('.input-search')[0]
  if (e.keyCode === 191 && searchField) {
    if (searchField.value.length) {
      searchField.selectionStart = 0
      searchField.selectionEnd = searchField.value.length
    }
    searchField.focus()
    e.preventDefault()
    return false
  }
}

$.getJSON(location.href.substring(0, location.href.lastIndexOf("/")) + '/js/vendor/emoji/emojilib/emojis.json', function (emojis) {
  var container = $('.emojis-container')
  Object.keys(emojis).forEach(function (key) {
    var emoji = emojis[key]
    if (emoji['category'] === '_custom') return

    var charHTML
    charHTML = '<div class="js-emoji-char native-emoji" title="' + key + '">' + emoji['char'] + '</div>'
    container.append('<li class="result emoji-wrapper js-emoji">' +
      charHTML + '<input type="text" class="js-emoji-code autofocus plain emoji-code" value=":' + key +
      ':" readonly /><span class="keywords">' + key + ' ' + emoji['keywords'] + '</span></li>')
  })
  $(document).trigger('emoji:ready')
  $('.emojis-container').toggleClass('hide-text', localStorage.getItem('emoji-text-display') === 'false')
})

$(document).keydown(function (e) { focusOnSearch(e) })

$(document).on('keydown', '.emoji-wrapper input', function (e) {
    console.log("key pressed");
  $('.input-search').blur()
  focusOnSearch(e)
})

$(document).on('click', '[data-clipboard-text]', function () {
  ga('send', 'event', 'copy', $(this).attr('data-clipboard-text'))
})

$(document).on('click', '.js-hide-text', function () {
  $('.emojis-container').toggleClass('hide-text')
  var showorhide = $('.emojis-container').hasClass('hide-text') ? 'hide' : 'show'
  localStorage.setItem('emoji-text-display', !$('.emojis-container').hasClass('hide-text'))
  ga('send', 'event', 'toggle text', showorhide)
  return false
})

$(document).on('click', '.js-clear-search, .mojigroup.active', function () {
  window.location.hash = ''
  return false
})

$(document).on('click', '.js-contribute', function () {
  ga('send', 'event', 'contribute', 'click')
})

function insertAtCaret(areaId,text) {
    var txtarea = document.getElementById(areaId);
    var scrollPos = txtarea.scrollTop;
    var strPos = 0;
    var br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ?
        "ff" : (document.selection ? "ie" : false ) );
    if (br == "ie") {
        txtarea.focus();
        var range = document.selection.createRange();
        range.moveStart ('character', -txtarea.value.length);
        strPos = range.text.length;
    }
    else if (br == "ff") strPos = txtarea.selectionStart;

    var front = (txtarea.value).substring(0,strPos);
    var back = (txtarea.value).substring(strPos,txtarea.value.length);
    txtarea.value=front+text+back;
    $(txtarea).trigger('input');
    strPos = strPos + text.length;
    if (br == "ie") {
        txtarea.focus();
        var range = document.selection.createRange();
        range.moveStart ('character', -txtarea.value.length);
        range.moveStart ('character', strPos);
        range.moveEnd ('character', 0);
        range.select();
    }
    else if (br == "ff") {
        txtarea.selectionStart = strPos;
        txtarea.selectionEnd = strPos;
        txtarea.focus();
    }
    txtarea.scrollTop = scrollPos;


}


