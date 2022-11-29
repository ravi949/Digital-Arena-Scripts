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
                    ["Gender", "Count"],
                    ["Male-"+getEmployeesByGender(1).count,getEmployeesByGender(1).count],
                    ["Female-"+getEmployeesByGender(2).count,getEmployeesByGender(2).count]
                ]);
              log.debug('listOfAvgs',listOfAvgs);
                var portlet = params.portlet;

                portlet.title = 'Employees By Gender';
                portlet.html = '<html><body><h1></h1>' +
                    '<script type="text/javascript" src="https://www.gstatic.com/charts/loader.js">' +
                    '</script><div id="piechart" style="width: 150px; height: 150px;"></div><script type="text/javascript">var a = ' + listOfAvgs + ';console.log(a);google.charts.load("current", {"packages":["corechart"]});' +
                    'google.charts.setOnLoadCallback(' + drawChart + ');</script></body></html>';


            } catch (e) {
                log.debug(e.name, e.message);
            }

        }

        function getEmployeesByGender(subID) {
          if(subID == 1){
             return search.create({
            	   type: "employee",
            	   filters:
            	   [
            	      ["gender","is","T"]
            	   ],
            	   columns:
            	   [
            	      search.createColumn({
            	         name: "entityid",
            	         sort: search.Sort.ASC,
            	         label: "Name"
            	      })
            	   ]            	
            }).runPaged();
          }
           
          if(subID == 2){
             return search.create({
            	   type: "employee",
            	   filters:
            	   [
            	      ["gender","is","F"]
            	   ],
            	   columns:
            	   [
            	      search.createColumn({
            	         name: "entityid",
            	         sort: search.Sort.ASC,
            	         label: "Name"
            	      })
            	   ]            	
            }).runPaged();
          }
        }

        function drawChart() {
            var data = google.visualization.arrayToDataTable(a);
            var options = {
                'title': '',
                'width': 200,
                'height': 160
            };
            var chart = new google.visualization.PieChart(document.getElementById('piechart'));
            chart.draw(data, options);

        }

      



        return {
            render: render
        };

    });