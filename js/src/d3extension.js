/**
 * 
 */
// Inject extended d3 funciton
d3.selection.prototype.bbox = function (refresh) {
    if (!refresh && this._bbox) {
        return this._bbox;
    }
    
    this._bbox = {x: 0, y: 0, width: 0, height: 0};
    for (var j = 0, m = this.length; j < m; j++) {
        for (var group = this[j], i = 0, n = group.length; i < n; i++) {
          var node = group[i];
          if (node && (node.nodeName === 'g' || node.nodeName === 'text')) {
              var _bbox = node._bbox;
              if (!_bbox || refresh) {
                  _bbox = bbox(node, refresh);
              }
              this._bbox.x = (_bbox.x < this._bbox.x) ? _bbox.x: this._bbox.x;
              this._bbox.y = (_bbox.y < this._bbox.y) ? _bbox.y : this._bbox.y;
              this._bbox.width = (_bbox.x + _bbox.width > this._bbox.x + this._bbox.width) ? _bbox.width: this._bbox.width;
              this._bbox.height = (_bbox.y + _bbox.height > this._bbox.y + this._bbox.height) ? _bbox.height: this._bbox.height;
          };
        }
    }
    return this._bbox;
};

d3.transition.prototype.bbox = d3.selection.prototype.bbox;

d3.selection.prototype.opts = function() {
	return arguments.length ? this.property("__opts__", value) : this.property("__opts__");
};