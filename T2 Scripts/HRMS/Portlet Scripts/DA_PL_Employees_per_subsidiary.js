/**
 * @NApiVersion 2.x
 * @NScriptType Portlet
 * @NModuleScope SameAccount
 */
define(['N/search'],

    function(search) {

        /**
         * Definition of the Portlet script trigger point.
         * 
         * @param {Object} params
         * @param {Portlet} params.portlet - The portlet object used for rendering
         * @param {number} params.column - Specifies whether portlet is placed in left (1), center (2) or right (3) column of the dashboard
         * @param {string} params.entity - (For custom portlets only) references the customer ID for the selected customer
         * @Since 2015.2
         */
        function render(params) {
            try {
                var listOfAvgs = JSON.stringify([
                    ["Subsidiary", "Subsidaiy ID"],
                    [getSubsidiaryName(1)+"-"+ getCustomersBySubsidiary(1).count, getCustomersBySubsidiary(1).count],
                    [getSubsidiaryName(2)+"-" + getCustomersBySubsidiary(2).count, getCustomersBySubsidiary(2).count],
                    [getSubsidiaryName(3)+"-" + getCustomersBySubsidiary(3).count, getCustomersBySubsidiary(3).count],
                    [getSubsidiaryName(4)+"-" + getCustomersBySubsidiary(4).count, getCustomersBySubsidiary(4).count],
                    [getSubsidiaryName(5)+"-"+ getCustomersBySubsidiary(5).count, getCustomersBySubsidiary(5).count],
                    [getSubsidiaryName(6)+"-"+ getCustomersBySubsidiary(6).count, getCustomersBySubsidiary(6).count],
                    [getSubsidiaryName(7)+"-" + getCustomersBySubsidiary(7).count, getCustomersBySubsidiary(7).count],
                    [getSubsidiaryName(8)+"-"+ getCustomersBySubsidiary(8).count, getCustomersBySubsidiary(8).count],
                    [getSubsidiaryName(9)+"-" + getCustomersBySubsidiary(9).count, getCustomersBySubsidiary(9).count],
                    [getSubsidiaryName(10)+"-" + getCustomersBySubsidiary(10).count, getCustomersBySubsidiary(10).count],
                    [getSubsidiaryName(11)+"-" + getCustomersBySubsidiary(11).count, getCustomersBySubsidiary(11).count],
                  [getSubsidiaryName(12)+"-" + getCustomersBySubsidiary(12).count, getCustomersBySubsidiary(12).count]
                ]);
                var portlet = params.portlet;

                portlet.title = 'Employess per Subsidiary';
                portlet.html = '<html><body><h1></h1>' +
                    '<script type="text/javascript" src="https://www.gstatic.com/charts/loader.js">' +
                    '</script><div id="piechart" style="width: 850px; height: 340px;"></div><script type="text/javascript">var a = ' + listOfAvgs + ';console.log(a);google.charts.load("current", {"packages":["corechart"]});' +
                    'google.charts.setOnLoadCallback(' + drawChart + ');</script></body></html>';


            } catch (e) {
                log.debug(e.name, e.message);
            }

        }

        function getCustomersBySubsidiary(subID) {
            return search.create({
                type: search.Type.EMPLOYEE,
                columns: ['internalid'],
                filters: [
                    ["subsidiary", "anyof", subID],
                    "AND",
                    ["isinactive", "is", "F"]
                ]
            }).runPaged();
        }

        function drawChart() {
            var data = google.visualization.arrayToDataTable(a);
            var options = {
                'title': '',
                'width': 850,
                'height': 350
            };
            var chart = new google.visualization.PieChart(document.getElementById('piechart'));
            chart.draw(data, options);

        }

        function getSubsidiaryName(id) {
            var subsidiarySearchObj = search.create({
                type: "subsidiary",
                filters: [
                    ["internalid", "anyof", id]
                ],
                columns: [
                    search.createColumn({
                        name: "name",
                        sort: search.Sort.ASC,
                        label: "Name"
                    })
                ]
            });
            var name;
            subsidiarySearchObj.run().each(function(result) {
                name = result.getValue('name');
            });
            return name;
        }



        return {
            render: render
        };

    });