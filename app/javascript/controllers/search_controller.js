var books = require('google-books-search')

var options = {
    limit: 40,
    order: 'relevance'
}

function scrollTop() {
  $("html, body").animate({ scrollTop: $('.search').offset().top }, 300)
}

import { Controller } from "stimulus"

export default class extends Controller {
  static targets = [ 'input','output','page','order']

  initialize() {
    this.showCurrentPage()
  }

  page() {
    scrollTop()
  }

  sort() {
    if (this.order == 'Date') {
      options.order = 'newest'
    } else if (this.order == 'Relevance') {
      options.order = 'relevance'
    }
    this.list()
  }

  next() {
    if (this.index == 0) {
      $('.page-1').removeClass('page-1')
    }
    this.index++
    scrollTop()
  }


  previous() {
    this.index--
    scrollTop()
  }

  showCurrentPage() {
    this.pageTargets.forEach((el, i) => {
      el.classList.toggle("page--current", this.index == i)
    })
  }

  get index() {
    return parseInt(this.data.get("index"))
  }

  set index(value) {
    this.data.set("index", value)
    this.showCurrentPage()
  }

  get input() {
    return this.inputTarget.value.trim()
  }

  get output() {
    return this.outputTarget
  }

  get order() {
    return this.orderTarget.value
  }

  list(event) {
    if (event) {
      event.preventDefault()
    }

    this.inputTarget.value = this.input
    this.output.textContent = `"${this.input}"`
    $('section.search').attr('data-search-index', 0)

    function prependURL(url) {
      if (url.substr(0, 8) !== 'http://' ) {
        return 'https://' + url.substr(7, url.length)
      } else {
        return url
      }
    }

    var bookResults = []

    if (this.input.length != 0) {
      books.search(this.input, options, function(error, results) {
        if (!error) {
          results.filter(function(result) {
            return !(result.title == undefined || result.authors == undefined || result.thumbnail == undefined || result.pageCount == undefined || result.publishedDate == undefined || result.link == undefined)
          }).every(function(result, index) {
            bookResults.push({ title: result.title, author: result.authors[0], thumbnail: prependURL(result.thumbnail), pageCount: result.pageCount, publishedDate: result.publishedDate, link: result.link })

            if (index == 34) {
              return false
            } else {
              return true
            }
          })

          function paginateBooks(arr, size) {
            var bookSets = []
            var j = 0
            var page

            $('#search-results').html('')

            for (var i = 0; i < Math.ceil(arr.length / size); i++) {
              bookSets[i] = arr.slice(j, j + size)
              j = j + size
            }

            bookSets.map(function(sets, index) {
              $('#search-results').append(`<div data-target="search.page" class="search__set page page-${index+1}"></div>`)
              page = index + 1

              for (var i = 0; i <= sets.length - 1; i ++) {
                $('.search__set:nth-of-type(' + page + ')').append(`
                  <li class="search__book">
                    <div class="search__book--detail">
                      <a href="${sets[i].link}" target="_blank">
                        <img class="search__image" src="${sets[i].thumbnail}" alt="${sets[i].title} cover">
                      </a>
                      <div class="search__info">
                        <a href="${sets[i].link}" target="_blank"><p class="search__title">${sets[i].title}</p></a>
                        <p class="search__author">by <span style="color: #003bcc; font-weight: bold">${sets[i].author}</span></p>
                        <p class="search__date"><strong>Published:</strong> ${moment(sets[i].publishedDate, 'YYYY-MM-DD').format('MMMM D, YYYY')}</p>
                        <p class="search__pages"><strong>Length:</strong> ${sets[i].pageCount} Pages</p>
                      </div>
                    </div>
                    <button class="search__book--action primary-btn" aria-label="Add book">Add Book</button>
                    <div class="search__book--added primary-btn secondary-btn hide" aria-label="Book added">Book Added!</div>
                  </li>`)
              }
            })

            $('.search__sort').removeClass('hide')
            $('.search__results').removeClass('hide')
            $('.search').removeClass('full-height')
            $('.results__copy').removeClass('hide')

            $('.search__set').append(`<div class="pagination">
              <button class="primary-btn" data-action="search#previous" aria-label="Previous page">← Prev</button>
              <button class="primary-btn page-number" data-action="search#page" aria-label="Current page"></button>
              <button class="primary-btn" data-action="search#next" aria-label="Next page">Next →</button>
              </div>`)

            for (var n = 1; n <= Math.ceil(arr.length / size); n++) {
              $('.search__set:nth-of-type(' + n + ') .pagination .page-number').append(n)
            }

            $('.search__set:nth-of-type(1) .pagination button:nth-of-type(1)').addClass('hide')
            $('.search__set:nth-of-type(' + Math.ceil(arr.length/size) + ') button:nth-of-type(3)').addClass('hide')
            $('.search__set .search__book:first-child').addClass('search__book--first')
          }
          paginateBooks(bookResults, 7)

        } else {
          console.log(error)
        }
      })
    } else {
      $('#search-results').html('')
      $('.search__sort').addClass('hide')
      $('.search__results').addClass('hide')
      $('.search').addClass('full-height')
      $('.results__copy').addClass('hide')
    }
  }
}
