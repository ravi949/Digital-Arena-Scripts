/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope TargetAccount
 */

define(['N/search', 'N/record', 'N/runtime', 'N/format'],
	function(search, record, runtime, format) {
		/**
		 * Marks the beginning of the Map/Reduce process and generates input data.
		 *
		 * @typedef {Object} ObjectRef
		 * @property {number} id - Internal ID of the record instance
		 * @property {string} type - Record type id
		 *
		 * @return {Array|Object|Search|RecordRef} inputSummary
		 * @since 2015.1
		 */
		function getInputData() {
			try {

				 var recID = runtime.getCurrentScript().getParameter({name:'custscript_da_shift_allocate_id'});

				 var customrecord_da_shift_time_sheetSearchObj = search.create({
				   type: "customrecord_da_shift_time_sheet",
				   filters:
				   [
				      ["custrecord_da_shift_allocate_ref","anyof",recID]
				   ]
				});
				var searchResultCount = customrecord_da_shift_time_sheetSearchObj.runPaged().count;
				log.debug("customrecord_da_shift_time_sheetSearchObj result count",searchResultCount);
				customrecord_da_shift_time_sheetSearchObj.run().each(function(result){
				   record.delete({
				   	type:'customrecord_da_shift_time_sheet',
				   	id: result.id
				   })
				   return true;
				});

				 return search.create({
				   type: "customrecord_da_shift_allocated_employee",
				   filters:
				   [
				      ["custrecord_da_shift_allocation_parent","anyof",recID]
				   ],
				   columns:
				   [
				      search.createColumn({
				         name: "scriptid",
				         sort: search.Sort.ASC,
				         label: "Script ID"
				      }),
				      search.createColumn({name: "custrecord_da_shift_alloc_empid", label: "Employee Name"})
				   ]
				});
				
			} catch (ex) {
				log.error(ex.name, 'getInputData state, message = ' + ex.message);
			}
		}
		/**
		 * Executes when the map entry point is triggered and applies to each key/value pair.
		 *
		 * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
		 * @since 2015.1
		 */
		function map(context) {
			try {
				var searchResult = JSON.parse(context.value);
				var values = searchResult.values;
				var empId = values["custrecord_da_shift_alloc_empid"].value;
				log.debug('EMpID', empId);
				context.write({
					key: empId,
					value: empId
				})
			} catch (ex) {
				log.error(ex.name, ex.message);
			}
		}
		/**
		 * Executes when the reduce entry point is triggered and applies to each group.
		 *
		 * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
		 * @since 2015.1
		 */
		function reduce(context) {
			try {
				var empId = JSON.parse(context.key);
				log.debug('reduce empId', empId);

				var recID = runtime.getCurrentScript().getParameter({name:'custscript_da_shift_allocate_id'});

				var shiftAllocationRec = record.load({
					type:'customrecord_da_emp_shift_allocation',
					id : recID
				});

				var fromDate = shiftAllocationRec.getValue('custrecord_da_shift_allocate_from');
				var toDate =  shiftAllocationRec.getValue('custrecord_da_shift_allocate_to');

				var timeTableDates = [];

				var dates = getDates(fromDate, toDate);
                dates.forEach(function(date) {
                    timeTableDates.push(date);
                });

                for(var i = 0 ; i < timeTableDates.length ;i++){
                	 //log.debug('date', timeTableDates[i]);
                	 //log.debug('day', timeTableDates[i].getDay());
                	 //
                	 var date = timeTableDates[i];
                     var fromDD = new Date(date).getDate();
							if (fromDD < 10) {
								fromDD = "0" + fromDD;
							}
							var fromMM = parseFloat(new Date(date).getMonth()) + parseFloat(1);
							if (fromMM < 10) {
								fromMM = "0" + fromMM;
							}
							var fromYY = new Date(date).getFullYear();
							date = fromDD + "/" + fromMM + "/" + fromYY;
                	 var customrecord_da_shift_time_sheetSearchObj = search.create({
                         type: "customrecord_da_shift_time_sheet",
                         filters:
                         [
                            ["custrecord_da_time_sheet_date","on",date], 
                            "AND", 
                            ["custrecord_da_time_sheet_employee","anyof",empId]
                         ],
                         columns:
                         [
                            search.createColumn({name: "custrecord_da_time_sheet_employee", label: "Employee"}),
                            search.createColumn({name: "custrecord_da_time_sheet_subsidairy", label: "Subsidiary"})
                         ]
                      });
                      var searchResultCount = customrecord_da_shift_time_sheetSearchObj.runPaged().count;
                      log.debug("customrecord_da_shift_time_sheetSearchObj result count",searchResultCount);
                      customrecord_da_shift_time_sheetSearchObj.run().each(function(result){
                         record.delete({
                           type:'customrecord_da_shift_time_sheet',
                           id: result.id
                         })
                         return true;
                      });

                	  var dateValue = format.parse({
                            value: timeTableDates[i],
                            type: format.Type.DATE
                      });
                      var workingType = shiftAllocationRec.getValue('custrecord_da_working_type_'+timeTableDates[i].getDay());
                      var shiftId =  shiftAllocationRec.getValue('custrecord_da_alloc_shift_1_'+timeTableDates[i].getDay());

                      log.debug('shiftId', shiftId);
                  
                  if(shiftId){

                      var shiftTimeSheet = record.create({
                      	 type:'customrecord_da_shift_time_sheet'
                      });
                      shiftTimeSheet.setValue('custrecord_da_time_sheet_employee', empId);
                      shiftTimeSheet.setValue('custrecord_da_shift_allocate_ref', recID);
                      shiftTimeSheet.setValue('custrecord_da_time_sheet_date', dateValue);
                      shiftTimeSheet.setValue('custrecord_da_time_sheet_type', workingType);
                      shiftTimeSheet.setValue('custrecord_da_time_sheet_shift', shiftId);
                      shiftTimeSheet.setValue('custrecord_da_emp_working_shift', 1);
                      shiftTimeSheet.save();
                  }

                      var doubleShiftId = shiftAllocationRec.getValue('custrecord_da_alloc_shift_2_'+timeTableDates[i].getDay());

                      if(doubleShiftId){
                      	 var shiftTimeSheet = record.create({
	                      	 type:'customrecord_da_shift_time_sheet'
	                      });
	                      shiftTimeSheet.setValue('custrecord_da_time_sheet_employee', empId);
	                      shiftTimeSheet.setValue('custrecord_da_shift_allocate_ref', recID);
	                      shiftTimeSheet.setValue('custrecord_da_time_sheet_date', dateValue);
	                      shiftTimeSheet.setValue('custrecord_da_time_sheet_type', workingType);
	                      shiftTimeSheet.setValue('custrecord_da_time_sheet_shift', doubleShiftId);
	                      shiftTimeSheet.setValue('custrecord_da_emp_working_shift', 2);
	                      shiftTimeSheet.save();
                      }
                }

			} catch (ex) {
				log.error(ex.name, ex.message);
			}
		}

		function calculateNoOfDays(date2, date1) {
			var res = Math.abs(date1 - date2) / 1000;
			var days = Math.floor(res / 86400);
			return days + 1;
		}

		function isFirstDay(dt) {
			var firstDay = new Date(dt.getFullYear(), dt.getMonth(), 1);
			if (firstDay.getDate() == dt.getDate()) {
				return true;
			} else {
				return false;
			}
		}

		function getDates(startDate, endDate) {
            var dates = [],
                currentDate = startDate,
                addDays = function(days) {
                    var date = new Date(this.valueOf());
                    date.setDate(date.getDate() + days);
                    return date;
                };
            while (currentDate <= endDate) {
                dates.push(currentDate);
                currentDate = addDays.call(currentDate, 1);
            }
            return dates;
        };

		function getLastDateOFPrevMonth(endDate) {
			var kuwaitTime = format.format({
				value: endDate,
				type: format.Type.DATETIME,
				timezone: format.Timezone.ASIA_RIYADH
			});
			var d = new Date(endDate);
			d.setDate(1);
			d.setHours(-20);
			return d;
		}

		function getFirstDateOfNextMonth(now) {
			if (now.getMonth() == 11) {
				var current = new Date(now.getFullYear() + 1, 0, 1);
				return current;
			} else {
				var current = new Date(now.getFullYear(), now.getMonth() + 1, 1);
				return current;
			}
		}

		function isLastDay(dt) {
			var test = new Date(dt.getTime()),
				month = test.getMonth();
			test.setDate(test.getDate() + 1);
			return test.getMonth() !== month;
		}

		function diff_months(dt2, dt1) {
			var diff = (dt2.getTime() - dt1.getTime()) / 1000;
			diff /= (60 * 60 * 24 * 7 * 4);
			return Math.floor(Math.abs(diff));
		}

		function daysInMonth(month, year) {
			return new Date(year, month, 0).getDate();
		}

		function convertminutes(hours, minutes) {
			return Number((hours * 60)) + Number(minutes);
		}
		/**
		 * Executes when the summarize entry point is triggered and applies to the result set.
		 *
		 * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
		 * @since 2015.1
		 */
		function summarize(summary) {
			try {
              
              var recID = runtime.getCurrentScript().getParameter({name:'custscript_da_shift_allocate_id'});
              var rec = record.load({
                type:'customrecord_da_emp_shift_allocation',
                id: recID
              }).setValue('custrecord_da_shift_all_generating', false).save();


			} catch (ex) {
				log.error(ex.name, ex.message);
			}
		}

		function removeDuplicateUsingFilter(arr) {
			var unique_array = arr.filter(function(elem, index, self) {
				return index == self.indexOf(elem);
			});
			return unique_array
		}
		return {
			getInputData: getInputData,
			map: map,
			reduce: reduce,
			summarize: summarize
		};
	});