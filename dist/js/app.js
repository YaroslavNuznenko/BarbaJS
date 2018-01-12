'use strict';

$(document).ready(function () {
    var lastClicked;
    var dataWidth, dataLeftPos, dataPrev, dataNext, dataScrollPos, dataBackPos;
    Barba.Dispatcher.on('linkClicked', function (el) {
        lastClicked = el;
        if ($(el).hasClass('mainItem')) {
            dataNext = $(el).nextAll();
            dataPrev = $(el).prevAll();
            dataWidth = $(el).width();
            dataLeftPos = $(el).offset().left;
            dataScrollPos = $('.items').scrollLeft();
            dataBackPos = $(el).find('.pageElement').position().left;
        }
    });

    //get element settings for back animation
    var ExpandTransition = Barba.BaseTransition.extend({
        start: function start() {
            Promise.all([this.newContainerLoading, this.zoom()]).then(this.showNewPage.bind(this));
        },
        zoom: function zoom() {
            var deferred = Barba.Utils.deferred();
            var tl = new TimelineMax();
            var left = lastClicked.getBoundingClientRect().left;
            var cloned = lastClicked.cloneNode(true);
            var nextAll = $(lastClicked).nextAll();
            var prevAll = $(lastClicked).prevAll();

            cloned.classList.add('is-cloned');
            this.oldContainer.appendChild(cloned);
            tl.set(cloned, { x: left });
            var screenWidth = $(window).width();
            var bg = $(cloned).find('.pageElement');

            tl.to(cloned, 1, {
                x: 0, width: screenWidth, onComplete: function onComplete() {
                    deferred.resolve();
                }
            }, 0);
            if (prevAll.length) {
                var prevAllLeft = prevAll[0].getBoundingClientRect().left;
                tl.staggerTo(prevAll, 1, {
                    cycle: {
                        x: function x(n) {
                            if (n < 3) {
                                return -(screenWidth / 3 + prevAllLeft);
                            }
                        }
                    }
                }, 0, 0);
            }
            if (nextAll.length) {
                var nextAllLeft = screenWidth - nextAll[0].getBoundingClientRect().left;
                tl.staggerTo(nextAll, 1, {
                    cycle: {
                        x: function x(n) {
                            if (n < 3) {
                                return nextAllLeft;
                            }
                        }
                    }
                }, 0, 0);
            }
            tl.to(bg, 1, { x: 0 }, 0);
            return deferred.promise;
        },

        showNewPage: function showNewPage() {
            var $el = $(this.newContainer);
            var thetitle = $(this.newContainer).find('.single__title');
            var timeline = new TimelineMax();
            $(this.oldContainer).hide();
            $el.css({
                visibility: 'visible'
            });

            timeline.to(thetitle, 1, { y: 0 });

            this.done();
        }
    });

    var BackTransition = Barba.BaseTransition.extend({
        start: function start() {
            this.newContainerLoading.then(this.zoom.bind(this));
        },
        zoom: function zoom() {
            var _this = this;
            var tl = new TimelineMax();
            var left = $('.fullPage').data('left_pos');
            var width = $('.fullPage').data('width');
            var prevAll = $('.fullPage').data('prev');
            var nextAll = $('.fullPage').data('next');
            var scrollPos = $('.fullPage').data('scroll');
            var img = parseInt($('.fullPage').data('back_pos'));
            var cloned = $('.fullPageItem').get(0);
            var bg = $(cloned).find('.animatedBackground');
            var prevWrap = $('.fullPage-cloned').find('.prevItemsWrap');
            var nextWrap = $('.fullPage-cloned').find('.nextItemsWrap');

            $('.fullPage').css('display', 'none');
            $('.fullPage-cloned').css('display', 'block');

            tl.to(cloned, 1, {
                x: left, width: width, onComplete: function onComplete() {
                    _this.done();
                }
            }, 0);
            if (prevAll.length) {
                //Добавление предыдущих соседей елемента
                for (var i = 0; i < prevAll.length; i++) {
                    $('.prevItemsWrap').prepend(prevAll[i]);
                    prevAll[i].classList.remove('mainItem');
                    prevAll[i].classList.add('prevItem');
                    $(prevAll[i]).css('transform', '');
                    $(prevAll[i]).outerWidth(width);
                }
                //Определение дополнительных переменных для расчетов
                $('.prevItemsWrap').offset({ left: -(prevAll.length * width) });
                var prevItemsLeft = $('.prevItemsWrap').offset().left;
                $('.prevItemsWrap').outerWidth(width * prevAll.length);
                var prevItemsWidth = $('.prevItemsWrap').outerWidth();
                var tmp_left = left;
                tl.to(prevWrap, 1, { x: tmp_left - prevItemsLeft - prevItemsWidth }, 0);
            }
            if (nextAll.length) {
                for (var _i = 0; _i < nextAll.length; _i++) {
                    $('.nextItemsWrap').append(nextAll[_i]);
                    nextAll[_i].classList.remove('mainItem');
                    nextAll[_i].classList.add('nextItem');
                    $(nextAll[_i]).css('transform', '');
                    $(nextAll[_i]).outerWidth(width);
                }
                $('.nextItemsWrap').offset({ left: $(window).width() });
                var nextItemsLeft = $('.nextItemsWrap').offset().left;
                $('.nextItemsWrap').outerWidth(width * nextAll.length);
                var _tmp_left = left;
                tl.to(nextWrap, 1, { x: -(nextItemsLeft - (_tmp_left + width)) }, 0);
            }
            tl.to(bg, 1, { x: img }, 0);
            $(this.newContainer).find('.items').scrollLeft(scrollPos);
        },
        showNewPage: function showNewPage() {
            var $el = $(this.newContainer);
            var timeline = new TimelineMax();
            $(this.oldContainer).hide();

            $el.css({
                visibility: 'visible'
            });

            this.done();
        }
    });
    //////////////////////////////
    //init additional pages, width data attributes
    function initDataForPages(num) {

        if (!dataWidth) {
            var parser_next = void 0,
                parser_prev = void 0,
                $next_mas = '',
                $prev_mas = '',
                screenWidth = $(window).width(),
                items_mas = ["<a class=\"mainItem\" href=\"1.html\">\n" + "                <div class=\"pageElement \" style=\" background-image: url('dist/img/1.jpg');\"></div>\n" + "            </a>", " <a  class=\"mainItem\" href=\"2.html\">\n" + "                <div class=\"pageElement \" style=\" background-image: url('dist/img/2.jpg');\"></div>\n" + "            </a>\n", "            <a class=\"mainItem\" href=\"3.html\">\n" + "                <div class=\"pageElement \" style=\" background-image: url('dist/img/3.jpg');\"></div>\n" + "            </a>", '<a class="mainItem" href="4.html">\n' + '                <div class="pageElement " style=" background-image: url(\'dist/img/4.jpg\');"></div>\n' + '            </a>', '<a class="mainItem" href="5.html">\n' + '                <div class="pageElement " style=" background-image: url(\'dist/img/5.jpg\');"></div>\n' + '            </a>', '<a class="mainItem" href="6.html">\n' + '                <div class="pageElement " style=" background-image: url(\'dist/img/6.jpg\');"></div>\n' + '            </a>'];
            dataWidth = screenWidth * 0.33;
            dataImgPos = -(screenWidth * 0.33);
            switch (num) {
                case 1:
                    dataLeftPos = 0;
                    dataPrev = $prev_mas;
                    parser_next = new DOMParser().parseFromString(items_mas[1] + items_mas[2] + items_mas[3], 'text/html');
                    $next_mas = $('a', parser_next);
                    dataNext = $next_mas;
                    dataScrollPos = 0;
                    break;
                case 2:
                    dataLeftPos = dataWidth;
                    parser_prev = new DOMParser().parseFromString(items_mas[0], 'text/html');
                    parser_next = new DOMParser().parseFromString(items_mas[2] + items_mas[3] + items_mas[4], 'text/html');
                    $next_mas = $('a', parser_next);
                    dataNext = $next_mas;
                    $prev_mas = $('a', parser_prev);
                    dataPrev = $prev_mas;
                    dataScrollPos = 0;
                    break;
                case 3:
                    dataLeftPos = dataWidth;
                    parser_prev = new DOMParser().parseFromString(items_mas[1] + items_mas[0], 'text/html');
                    parser_next = new DOMParser().parseFromString(items_mas[3] + items_mas[4] + items_mas[5], 'text/html');
                    $next_mas = $('a', parser_next);
                    dataNext = $next_mas;
                    $prev_mas = $('a', parser_prev);
                    dataPrev = $prev_mas;
                    dataScrollPos = screenWidth / 3;
                    break;
                case 4:
                    dataLeftPos = dataWidth;
                    parser_prev = new DOMParser().parseFromString(items_mas[2] + items_mas[1] + items_mas[0], 'text/html');
                    parser_next = new DOMParser().parseFromString(items_mas[4] + items_mas[5], 'text/html');
                    $next_mas = $('a', parser_next);
                    dataNext = $next_mas;
                    $prev_mas = $('a', parser_prev);
                    dataPrev = $prev_mas;
                    dataScrollPos = screenWidth / 3 * 2;
                    break;
                case 5:
                    dataLeftPos = dataWidth;
                    parser_prev = new DOMParser().parseFromString(items_mas[3] + items_mas[2] + items_mas[1], 'text/html');
                    parser_next = new DOMParser().parseFromString(items_mas[5], 'text/html');
                    $next_mas = $('a', parser_next);
                    dataNext = $next_mas;
                    $prev_mas = $('a', parser_prev);
                    dataPrev = $prev_mas;
                    dataScrollPos = screenWidth;
                    break;
                case 6:
                    dataLeftPos = screenWidth;
                    parser_prev = new DOMParser().parseFromString(items_mas[4] + items_mas[3] + items_mas[2], 'text/html');
                    dataNext = $next_mas;
                    $prev_mas = $('a', parser_prev);
                    dataPrev = $prev_mas;
                    dataScrollPos = screenWidth;
                    break;
            }
        }
        $('.fullPage').data('width', dataWidth);
        $('.fullPage').data('left_pos', dataLeftPos);
        $('.fullPage').data('prev', dataPrev);
        $('.fullPage').data('next', dataNext);
        $('.fullPage').data('scroll', dataScrollPos);
        $('.fullPage').data('back_pos', dataBackPos);
    }

    Barba.Dispatcher.on('transitionCompleted', function (currentStatus, prevStatus, HTMLElementContainer) {
        var num = currentStatus.url.match('\\d(?=\\D*$)');
        if (currentStatus.namespace === 'detail') {
            initDataForPages(parseInt(num[0]));
        }
    });

    /////////////////////////////////////////////
    Barba.Pjax.getTransition = function () {
        var transitionObj = ExpandTransition;

        if (Barba.HistoryManager.prevStatus().namespace === 'detail') {
            transitionObj = BackTransition;
        }
        return transitionObj;
    };

    Barba.Pjax.start();
});