angular.module('direct', [])
    /*子元素滚动完父元素不滚动*/
    .directive('scrollSelf', function() {
        return {
            restrict: 'A',
            scope: {},
            link: function(scope, elem) {
                var eventType = 'mousewheel';
                if (document.mozHidden !== undefined) {
                    eventType = 'DOMMouseScroll';
                }
                elem.on(eventType, function(event) {
                    var scrollTop = this.scrollTop, //滚动条距顶部距离
                        scrollHeight = this.scrollHeight,   //可滚动高度
                        height = this.clientHeight; //元素高度

                    //兼容性处理
                    var delta = (event.wheelDelta) ? event.wheelDelta : -(event.detail || 0);

                    if ((delta > 0 && scrollTop <= delta) || (delta < 0 && scrollHeight - height - scrollTop <= -1 * delta)) {
                        // IE浏览器下滚动会跨越边界直接影响父级滚动，因此，临界时候手动边界滚动定位
                        this.scrollTop = delta > 0? 0: scrollHeight;
                        // 向上滚 || 向下滚
                        event.preventDefault();
                    }
                });
            }
        }
    })
    /*自动获取焦点*/
    .directive('autoFocus', function() {
        return {
            restrict: 'A',
            scope: {},
            link: function(scope, elem) {
                var sele = location.hash;
                [].slice.call(elem.find('a')).forEach(function(item) {
                    item = angular.element(item)
                    if (item.attr('href') == sele) {
                        item.parent('li').addClass('active')
                    }
                })

                elem.children().on('click', function() {
                    elem.children().removeClass('active');
                    angular.element(this).addClass('active');
                })
            }
        }
    })
    /*分页*/
    .directive('pagination', function($http) {
        return {
            restrict: 'E',
            replace: true,
            scope: true,
            template: `
                <nav>
                    <ul class="pagination">
                        <li class="page-first"><a href="javascript:;">首页</a></li>
                        <li class="page-prev">
                            <a href="javascript:;">上一页</a>
                        </li>
                        <li ng-show="prev"><a>...</a></li>
                        <li class="page-item" ng-repeat="p in pages track by $index"
                            ng-class="{true: 'active'}[p === index]">
                        <a href="javascript:;">{{p}}</a></li>
                        <li ng-show="next"><a>...</a></li>
                        <li class="page-next">
                            <a href="javascript:;">下一页</a>
                        </li>
                        <li class="page-last"><a href="javascript:;">尾页</a></li>
                    </ul>
                </nav>
            `,
            link: function(scope, elem, attrs) {
                scope.pages = [];
                scope.index = 1; //标注当前获得焦点的位置

                //前后省略号的显示和隐藏
                scope.prev = false; 
                scope.next = false;
                
                //最大显示数目
                var max = parseInt(attrs.max);
                //基础路径
                var base = attrs.base;
                //分页块名称(解决多个分页时出现冲突)
                var name = (attrs.name && attrs.name + '-') || '';

                var url = base;

                //初始化加载
                load(base + scope.index);

                scope.$on(name + 'pageTotal', function($e, data) {
                    //分页条初始化
                    var total = parseInt(data)
                    if (max < total) {
                        for (let i = 1; i <= max; i++) {
                            scope.pages.push(i);
                        }
                        scope.next = true;
                    } else {
                        for (let i = 1; i <= total; i++) {
                            scope.pages.push(i);
                        }
                    }

                    /*按钮点击事件注册(加载，焦点)*/
                    elem.find('ul').on('click', function(e) {
                        var self = angular.element(e.target);
                        self = self.parent('li')
                        //当前页面已激活
                        if (self.hasClass('active')) {
                            return false;
                        }
                        var index = scope.index;
                        var curr = parseInt(self.text().trim());

                        if (self.hasClass('page-next')) {
                            next(index, total);
                        }
                        else if (self.hasClass('page-prev')) {
                            prev(index, total);
                        }
                        else if (self.hasClass('page-first')) {
                            first(total);
                        }
                        else if (self.hasClass('page-last')) {
                            last(total);
                        }
                        else if (self.hasClass('page-item')) {
                            jump(curr, total);
                        }

                        //获取数据,并传给上级scope
                        load(url);
                    })

                        
                })

                //下一页
                function next(index, total) {
                    var last = scope.pages[scope.pages.length - 1];
                    var aveg = Math.round((max + 1) / 2);
                    //防止active超出
                    if (index === total) return;
                    //隐藏尾部省略号
                    if (last + 1 === total && index + 1 > aveg) scope.next = false;

                    if (index + 1 > aveg && last < total) {
                        scope.pages = scope.pages.map(item => item + 1);
                        scope.prev = true;
                    }
                    
                    url = base + ++index
                    scope.index++;  //焦点前移
                }

                //上一页
                function prev(index, total) {
                    var first = scope.pages[0];
                    var last = scope.pages[scope.pages.length - 1];
                    var aveg = total - Math.floor((max - 1) / 2);
                    //防止active超出
                    if (index === 1) return;
                    //隐藏尾部省略号
                    if (first - 1 === 1 && index - 1 < aveg) scope.prev = false;

                    if (index - 1 < aveg && first > 1) {
                        scope.pages = scope.pages.map(item => item - 1);
                        scope.next = true;
                        
                    }
                    url = base + --index
                    scope.index--;
                }

                //点击跳转
                function jump(index, total) {
                    if (max < total) {
                        if (index - 3 > 1 && index + 2 < total) {
                            scope.pages = scope.pages.map((it, ind) => index - 3 + ind);
                            scope.prev = true;
                            scope.next = true;
                        }
                        else if (index - 3 <= 1) {
                            scope.pages = scope.pages.map((it, ind) => ind + 1);
                            scope.prev = false;
                            scope.next = true;
                        }
                        else {
                            scope.pages = scope.pages.map((it, ind) => total - max + 1 + ind);
                            scope.prev = true;
                            scope.next = false;
                        }
                    }
                    url = base + index;
                    scope.index = index;
                }

                //首页
                function first(total) {
                    if (max < total) {
                        scope.prev = false;
                        scope.next = true;
                        scope.pages = scope.pages.map((it, ind) => ind + 1);
                    }
                    scope.index = 1;
                    url = base + 1;
                }

                //尾页
                function last(total) {
                    if (max < total) {
                        scope.prev = true;
                        scope.next = false; 
                        scope.pages = scope.pages.map((it, ind) => total - max + 1 + ind);
                    }
                    scope.index = total;
                    url = base + total;
                }         
                
                //获取数据
                function load(url) {
                    $http.get(url)
                        .success(function(data) {
                            scope.$emit(name + 'pageMsg', null, data);
                        })
                        .error(function(err) {
                            scope.$emit(name + 'pageMsg', err, null);
                        })
                }
            }
        }
    })
