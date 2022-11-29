/**
 * @NScriptName Google Chart - Suitelet Script
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(["require", "exports", "N/search", "N/ui/serverWidget"], function (require, exports, search, ui) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function onRequest(context) {
        if (context.request.method === "GET") {
            var savedSearchID = "customsearch_da_stock_exchange";
            var columns = ["TSCO", "APPL"];
            var useMaterial = 0;
            var materialOptions = {
                chart: {
                    title: 'Stock Exchange'
                },
                width: 1000,
                height: 500,
            };
            var classicOptions = {
                colors: ['#a52714', '#097138'],
                hAxis: {
                    title: 'Date',
                    logScale: false
                },
                vAxis: {
                    title: 'Amount',
                    logScale: false
                }
            };
            var chartOptions = useMaterial ? materialOptions : classicOptions;
            var savedSearch = search.load({
                id: savedSearchID,
            }).run();
            var tempResults = void 0, results = [], lastIndex = 0;
            do {
                tempResults = savedSearch.getRange({
                    start: lastIndex,
                    end: lastIndex + 1000
                });
                if (tempResults) {
                    results = results.concat(tempResults);
                    lastIndex += 1000;
                }
            } while (tempResults && tempResults.length === 1000);
            var formulaKeys = getFormulaKeys(results);
            var data = [];
            for (var i = 0; i < results.length; i++) {
                var values = results[i].getAllValues();
                var date = values["GROUP(trandate)"];
                var amounts = [];
                for (var j = 0; j < formulaKeys.length; j++) {
                    amounts.push(Number(values[formulaKeys[j]]));
                }
                data.push([date].concat(amounts));
            }
            var addColumnsStr = getAddColumns(columns);
            var html = "\n        <script type=\"text/javascript\" src=\"https://www.gstatic.com/charts/loader.js\"></script>\n        <div id=\"chart_div\" style=\"width: 80%; height: 500px; margin: 0 auto;\"></div>\n        <script type=\"text/javascript\">\n            google.charts.load('current', {\n                'packages':['corechart', 'line'],\n            });\n            google.charts.setOnLoadCallback(drawVisualization);\n        \n            function drawVisualization() {\n                var data = new google.visualization.DataTable();\n                data.addColumn('string', 'Dates');\n                " + addColumnsStr + "\n\n                data.addRows(" + JSON.stringify(data) + ");\n            \n                var options = " + JSON.stringify(chartOptions) + ";\n            \n                var chart = new google." + (useMaterial ? "charts.Line" : "visualization.LineChart") + "(document.getElementById('chart_div'));\n\n                chart.draw(data, options);\n            }\n        </script>";
            var form = ui.createForm({ title: ' ', hideNavBar: true });
            var chartField = form.addField({
                id: 'google_map_chart_html',
                label: ' ',
                type: ui.FieldType.INLINEHTML
            });
            chartField.defaultValue = html;
            context.response.writePage(form);
        }
    }
    exports.onRequest = onRequest;
    function getFormulaKeys(searchResults) {
        var keys = [];
        if (searchResults.length) {
            var values = searchResults[0].getAllValues();
            Object.keys(values).forEach(function (key) {
                if (key.indexOf("SUM(formulanumeric)") !== -1) {
                    keys.push(key);
                }
            });
        }
        return keys;
    }
    function getAddColumns(columns) {
        var columnsStr = "";
        for (var i = 0; i < columns.length; i++) {
            columnsStr += "data.addColumn(\"number\", \"" + columns[i] + "\"); ";
        }
        return columnsStr;
    }
});