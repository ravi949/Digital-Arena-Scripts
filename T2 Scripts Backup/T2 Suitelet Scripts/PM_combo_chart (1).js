/**
 * @NScriptName Geocoding Script
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(["require", "exports", "N/search", "N/ui/serverWidget"], function (require, exports, search, ui) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function onRequest(context) {
        if (context.request.method === "GET") {
            var chartOptions = {
                title: ' ',
                vAxis: { title: 'Figures' },
                hAxis: { title: 'Project Tasks' },
                seriesType: "bars",
                series: { 8: { type: 'line' } },
                colors: ["#E71B4C","#FF4BE2"]
            };
            var savedSearch = search.load({
                id: "customsearchprojecttasksplanning_2",
            }).run();
          log.debug('', savedSearch)
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
            var data = [];
            data.push(["Project Task", "Budget", "Actual"]); // Headers
            for (var i = 0; i < results.length; i++) {
                var values = results[i].getAllValues();
                var keys = Object.keys(values);
                var countryName = values["GROUP(title)"];
              //[0]["text"]
                // var countryCode = values["name"][0]["value"];
                var value_1 = Number(values["GROUP(formulanumeric)"]);
                var value_2 = Number(values["GROUP(formulanumeric)_1"]);
                //var value_3 = Number(values["GROUP(formulanumeric)_2"]);
               // var value_4 = Number(values["GROUP(formulanumeric)_3"]);
               // var value_5 = Number(values["GROUP(formulanumeric)_4"]);
               // var value_6 = Number(values["GROUP(formulanumeric)_5"]);
               // var value_7 = Number(values["GROUP(formulanumeric)_6"]);
               // var value_8 = Number(values["GROUP(formulanumeric)_7"]);

                data.push([countryName, value_1, value_2]);
            }
            var html = "\n        <script type=\"text/javascript\" src=\"https://www.gstatic.com/charts/loader.js\"></script>\n        <div id=\"chart_div\" style=\"width: 80%; height: 500px; margin: 0 auto;\"></div>\n        <script type=\"text/javascript\">\n            google.charts.load('current', {\n                'packages':['corechart'],\n                'mapsApiKey': 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY'\n            });\n            google.charts.setOnLoadCallback(drawVisualization);\n        \n            function drawVisualization() {\n                var data = google.visualization.arrayToDataTable(" + JSON.stringify(data) + ");\n            \n                var options = " + JSON.stringify(chartOptions) + ";\n            \n                var chart = new google.visualization.ComboChart(document.getElementById('chart_div'));\n\n                chart.draw(data, options);\n            }\n        </script>";
            var form = ui.createForm({ title: 'Project Chart Budget v.s. Actual', hideNavBar: true });
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
});
