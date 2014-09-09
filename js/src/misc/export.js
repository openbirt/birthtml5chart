var aCharts = window.aCharts || {};

aCharts.format = {};
aCharts.format.formatInt = formatInt;
aCharts.format.formatPercent = formatPercent;
aCharts.TWO_PI = twoPi;
aCharts.DEFAULT_DURATION = DEFAULT_DURATION;
aCharts.DEFAULT_EASE = DEFAULT_EASE;

aCharts.util = aCharts.util || {};
aCharts.util.toCssStyle = toCssStyle;
aCharts.util.adaptSize = adaptSize;


aCharts.Bar = Bar;
aCharts.Donut = DonutChart;

window.aCharts = window.aCharts || aCharts;