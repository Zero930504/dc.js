/**
 * This Mixin provides reusable functionalities for any chart that needs to visualize data using bubbles.
 * @name bubbleMixin
 * @memberOf dc
 * @mixin
 * @mixes colorMixin
 * @param {Chart} _chart
 * @returns {Chart}
 */
dc.bubbleMixin = function (_chart) {
    var _maxBubbleRelativeSize = 0.3;
    var _minRadiusWithLabel = 10;

    _chart.BUBBLE_NODE_CLASS = 'node';
    _chart.BUBBLE_CLASS = 'bubble';
    _chart.MIN_RADIUS = 10;

    _chart = dc.colorMixin(_chart);

    _chart.renderLabel(true);

    _chart.data(function (group) {
        return group.top(Infinity);
    });

    var _r = d3.scale.linear().domain([0, 100]);

    var _rValueAccessor = function (d) {
        return d.r;
    };

    /**
     * Get or set the bubble radius scale. By default the bubble chart uses
     * `d3.scale.linear().domain([0, 100])` as its r scale .
     * @name r
     * @memberOf dc.bubbleMixin
     * @instance
     * @param {Number[]} [bubbleRadiusScale]
     * @returns {Number[]}
     */
    _chart.r = function (bubbleRadiusScale) {
        if (!arguments.length) {
            return _r;
        }
        _r = bubbleRadiusScale;
        return _chart;
    };

    /**
     * Get or set the radius value accessor function. If set, the radius value accessor function will
     * be used to retrieve a data value for each bubble. The data retrieved then will be mapped using
     * the r scale to the actual bubble radius. This allows you to encode a data dimension using bubble
     * size.
     * @name radiusValueAccessor
     * @memberOf dc.bubbleMixin
     * @instance
     * @param {Function} [radiusValueAccessor]
     * @returns {Function}
     */
    _chart.radiusValueAccessor = function (radiusValueAccessor) {
        if (!arguments.length) {
            return _rValueAccessor;
        }
        _rValueAccessor = radiusValueAccessor;
        return _chart;
    };

    _chart.rMin = function () {
        var min = d3.min(_chart.data(), function (e) {
            return _chart.radiusValueAccessor()(e);
        });
        return min;
    };

    _chart.rMax = function () {
        var max = d3.max(_chart.data(), function (e) {
            return _chart.radiusValueAccessor()(e);
        });
        return max;
    };

    _chart.bubbleR = function (d) {
        var value = _chart.radiusValueAccessor()(d);
        var r = _chart.r()(value);
        if (isNaN(r) || value <= 0) {
            r = 0;
        }
        return r;
    };

    var labelFunction = function (d) {
        return _chart.label()(d);
    };

    var labelOpacity = function (d) {
        return (_chart.bubbleR(d) > _minRadiusWithLabel) ? 1 : 0;
    };

    _chart._doRenderLabel = function (bubbleGEnter) {
        if (_chart.renderLabel()) {
            var label = bubbleGEnter.select('text');

            if (label.empty()) {
                label = bubbleGEnter.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dy', '.3em')
                    .on('click', _chart.onClick);
            }

            label
                .attr('opacity', 0)
                .text(labelFunction);
            dc.transition(label, _chart.transitionDuration())
                .attr('opacity', labelOpacity);
        }
    };

    _chart.doUpdateLabels = function (bubbleGEnter) {
        if (_chart.renderLabel()) {
            var labels = bubbleGEnter.selectAll('text')
                .text(labelFunction);
            dc.transition(labels, _chart.transitionDuration())
                .attr('opacity', labelOpacity);
        }
    };

    var titleFunction = function (d) {
        return _chart.title()(d);
    };

    _chart._doRenderTitles = function (g) {
        if (_chart.renderTitle()) {
            var title = g.select('title');

            if (title.empty()) {
                g.append('title').text(titleFunction);
            }
        }
    };

    _chart.doUpdateTitles = function (g) {
        if (_chart.renderTitle()) {
            g.selectAll('title').text(titleFunction);
        }
    };

    /**
     * Get or set the minimum radius for label rendering. If a bubble's radius is less than this value
     * then no label will be rendered.
     * @name minRadiusWithLabel
     * @memberOf dc.bubbleMixin
     * @instance
     * @param {Number} [radius=10]
     * @returns {Number}
     */
    _chart.minRadiusWithLabel = function (radius) {
        if (!arguments.length) {
            return _minRadiusWithLabel;
        }
        _minRadiusWithLabel = radius;
        return _chart;
    };

    /**
     * Get or set the maximum relative size of a bubble to the length of x axis. This value is useful
     * when the difference in radius between bubbles is too great.
     * @name maxBubbleRelativeSize
     * @memberOf dc.bubbleMixin
     * @instance
     * @param {Number} [relativeSize=0.3]
     * @returns {Number}
     */
    _chart.maxBubbleRelativeSize = function (relativeSize) {
        if (!arguments.length) {
            return _maxBubbleRelativeSize;
        }
        _maxBubbleRelativeSize = relativeSize;
        return _chart;
    };

    _chart.fadeDeselectedArea = function () {
        if (_chart.hasFilter()) {
            _chart.selectAll('g.' + _chart.BUBBLE_NODE_CLASS).each(function (d) {
                if (_chart.isSelectedNode(d)) {
                    _chart.highlightSelected(this);
                } else {
                    _chart.fadeDeselected(this);
                }
            });
        } else {
            _chart.selectAll('g.' + _chart.BUBBLE_NODE_CLASS).each(function () {
                _chart.resetHighlight(this);
            });
        }
    };

    _chart.isSelectedNode = function (d) {
        return _chart.hasFilter(d.key);
    };

    _chart.onClick = function (d) {
        var filter = d.key;
        dc.events.trigger(function () {
            _chart.filter(filter);
            _chart.redrawGroup();
        });
    };

    return _chart;
};
