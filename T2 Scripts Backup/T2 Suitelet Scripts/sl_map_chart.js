/**
 * @NScriptName Geocoding Script
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(["require", "exports", "N/search", "N/ui/serverWidget", "N/log"], function (require, exports, search, ui, log) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function onRequest(context) {
        if (context.request.method === "GET") {
            var customerSearch = search.create({
                type: search.Type.CUSTOMER,
                columns: ["country"]
            }).run().getRange({ start: 0, end: 999 });
            log.debug("customers' search", customerSearch);
            // let dataTable = [
            //     ['Country', 'Popularity'],
            //     ['Egypt', 800],
            //     ['Germany', 200],
            //     ['United States', 300],
            //     ['Brazil', 400],
            //     ['Canada', 500],
            //     ['France', 600]
            // ];
            // dataTable.push(['China', 1000]);
            var html = "\n        <script type=\"text/javascript\" src=\"https://www.gstatic.com/charts/loader.js\"></script>\n        <div id=\"map_regions_div\" style=\"width: 900px; height: 500px;\"></div>\n        <script type=\"text/javascript\">\n            google.charts.load('current', {\n                'packages':['geochart'],\n                'mapsApiKey': 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY'\n            });\n            google.charts.setOnLoadCallback(drawRegionsMap);\n        \n            function drawRegionsMap() {\n                var data = google.visualization.arrayToDataTable([\n                    ['Country', 'Popularity'],\n                    ['Germany', 200],\n                    ['United States', 300],\n                    ['Brazil', 400],\n                    ['Canada', 500],\n                    ['France', 600],\n                    ['RU', 700]\n                ]);\n            \n                var options = {};\n            \n                var chart = new google.visualization.GeoChart(document.getElementById('map_regions_div'));\n            \n                chart.draw(data, options);\n            }\n        </script>";
            var form = ui.createForm({ title: 'Google Map Chart' });
            var chartField = form.addField({
                id: 'google_map_chart_html',
                label: 'Google Map Chart',
                type: ui.FieldType.INLINEHTML
            });
            chartField.defaultValue = html;
            context.response.writePage(form);
        }
    }
    exports.onRequest = onRequest;
});
