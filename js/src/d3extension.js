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
              var bbox = node._bbox;
              if (!bbox || refresh) {
                  bbox = bbox || node.getBBox();
              }
              this._bbox.x = (bbox.x < this._bbox.x) ? bbox.x: this._bbox.x;
              this._bbox.y = (bbox.y < this._bbox.y) ? bbox.y : this._bbox.y;
              this._bbox.width = (bbox.x + bbox.width > this._bbox.x + this._bbox.width) ? bbox.width: this._bbox.width;
              this._bbox.height = (bbox.y + bbox.height > this._bbox.y + this._bbox.height) ? bbox.height: this._bbox.height;
          };
        }
    }
    return this._bbox;
};

d3.transition.prototype.bbox = d3.selection.prototype.bbox;