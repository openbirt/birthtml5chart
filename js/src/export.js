/**
 * New node file
 */
var birtchart = birtchart || {};
birtchart.Global = Global;
birtchart.Context = Context;
birtchart.Text = Text;
birtchart.Label = Label;

var util = util || {};
birtchart.util = util;
util.DPI = DPI;
util.getDPI = getDPI;
util.uniqueId = uniqueId;
util.clone = clone;
util.copy = copy;
util.merge = merge;
util.isFunction = isFunction;
util.isNumber = isNumber;
util.isObject = isObject;
util.isString = isString;
util.emptyObject = emptyObject;
util.toRadian = toRadian;
util.toDegree = toDegree;
util.toArray = toArray;
util.rotateNode = rotateNode;
util.adaptSize = adaptSize;

window.birtchart = window.birtchart || birtchart;
