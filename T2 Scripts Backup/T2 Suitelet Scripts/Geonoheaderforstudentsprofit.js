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
                //backgroundColor: '#5786ff',
                datalessRegionColor: "#F5F5F5",
                colorAxis: { minValue: 0, colors: ['yellow', 'red', 'blue'] }
            };
            var savedSearch = search.load({
                id: 'customsearch_da_students_by_country_of_2',
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
            var data = [];
            data.push(["Country", "Popularity"]); // Header
            for (var i = 0; i < results.length; i++) {
                var values = results[i].getAllValues();
                var countryName = values["GROUP(custentity_da_nationality_geo_code)"][0]["text"];
                var countryCode = values["GROUP(custentity_da_nationality_geo_code)"][0]["value"];
                var count = Number(values["SUM(formulacurrency)"]);
                data.push([countryName, count]);
            }
            var html = "\n        <script type=\"text/javascript\" src=\"https://www.gstatic.com/charts/loader.js\"></script>\n        <div id=\"map_regions_div\" style=\"width: 80%; height: 500px; margin: 0 auto;\"></div>\n        <script type=\"text/javascript\">\n            google.charts.load('current', {\n                'packages':['geochart'],\n                'mapsApiKey': 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY'\n            });\n            google.charts.setOnLoadCallback(drawRegionsMap);\n        \n            function drawRegionsMap() {\n                var data = google.visualization.arrayToDataTable(" + JSON.stringify(data) + ");\n            \n                var options = " + JSON.stringify(chartOptions) + ";\n            \n                var chart = new google.visualization.GeoChart(document.getElementById('map_regions_div'));\n\n                chart.draw(data, options);\n            }\n        </script>";
            var form = ui.createForm({ title: 'Sales by Country of Birth', hideNavBar: true });
            var chartField = form.addField({
                id: 'google_map_chart_html',
                label: 'Sales by Country of Birth',
                type: ui.FieldType.INLINEHTML
            });
            chartField.defaultValue = html;
            context.response.writePage(form);
        }
    }
    exports.onRequest = onRequest;
});
