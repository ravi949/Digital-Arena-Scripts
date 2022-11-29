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
					var customrecord_da_shift_attendance_reportSearchObj = search.create({
						type: "customrecord_da_shift_attendance_report",
						filters: [
							["custrecord_da_atten_report_date", "within", "today"]
						],
						columns: [
							search.createColumn({
								name: "scriptid",
								sort: search.Sort.ASC,
								label: "Script ID"
							}),
							search.createColumn({
								name: "custrecord_da_atten_report_date",
								label: "Date"
							})
						]
					});
					var searchResultCount = customrecord_da_shift_attendance_reportSearchObj.runPaged().count;
					log.debug("customrecord_da_shift_attendance_reportSearchObj result count", searchResultCount);
					customrecord_da_shift_attendance_reportSearchObj.run().each(function(result) {
						record.delete({
							type: 'customrecord_da_shift_attendance_report',
							id: result.id
						})
						return true;
					});
					return search.create({
						type: "customrecord_da_shift_time_sheet",
						filters: [
							["custrecord_da_time_sheet_date", "within", "today"], "AND",
							["custrecord_da_time_sheet_shift_type", "anyof", "2"]
						],
						columns: [
							search.createColumn({
								name: "custrecord_da_time_sheet_employee",
								label: "Employee"
							}),
							search.createColumn({
								name: "custrecord_da_time_sheet_subsidairy",
								label: "Subsidiary"
							})
						]
					});
					var searchResultCount = customrecord_da_shift_time_sheetSearchObj.runPaged().count;
					log.debug("customrecord_da_shift_time_sheetSearchObj result count", searchResultCount);
					customrecord_da_shift_time_sheetSearchObj.run().each(function(result) {
						// .run().each has a limit of 4,000 results
						return true;
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
					var arrResult = searchResult.values;
					log.debug('arrResult', arrResult);
					var empId = arrResult["custrecord_da_time_sheet_employee"].value;
					var SubsidiaryId = arrResult["custrecord_da_time_sheet_subsidairy"].value;
					context.write({
						key: {
							empId: empId
						},
						value: {
							SubsidiaryId: SubsidiaryId
						}
					});
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
					var key = JSON.parse(context.key);
					var empId = key.empId;
					log.debug('empId', empId);
					var val = JSON.parse(context.values[0]);
					var SubsidiaryId = val.SubsidiaryId;
					log.debug('SubsidiaryId', SubsidiaryId);
					var yesterday = new Date(today_date);
					yesterday.setDate(yesterday.getDate() - 1);
					var attendanceReportRec = record.create({
						type: 'customrecord_da_shift_attendance_report'
					});
					attendanceReportRec.setValue('custrecord_da_attn_report_employee', empId);
					attendanceReportRec.setValue('custrecord_da_atten_report_date', yesterday);
					var shiftId, attIn, attOut, attInValue, attOutValue;
					//Getting Shift
					var customrecord_da_shift_time_sheetSearchObj = search.create({
						type: "customrecord_da_shift_time_sheet",
						filters: [
							["custrecord_da_emp_working_shift", "anyof", "1"],
							"AND",
							["custrecord_da_time_sheet_employee", "anyof", empId],
							"AND",
							["custrecord_da_time_sheet_date", "within", "yesterday"],
							"AND",
							["custrecord_da_time_sheet_shift_type", "anyof", "2"]
						],
						columns: [
							search.createColumn({
								name: "scriptid",
								sort: search.Sort.ASC,
								label: "Script ID"
							}),
							search.createColumn({
								name: "custrecord_da_time_sheet_employee",
								label: "Employee"
							}),
							search.createColumn({
								name: "custrecord_da_time_sheet_date",
								label: "Date"
							}),
							search.createColumn({
								name: "custrecord_da_time_sheet_type",
								label: "Type"
							}),
							search.createColumn({
								name: "custrecord_da_time_sheet_shift",
								label: "Shift"
							}),
							search.createColumn({
								name: "custrecord_da_time_sheet_shift_in",
								label: "Shift Time In"
							}),
							search.createColumn({
								name: "custrecord_da_ts_shift_time_out",
								label: "Shift Time Out"
							}),
							search.createColumn({
								name: "custrecord_da_time_sheet_shift_type",
								label: "Shift Type"
							}),
							search.createColumn({
								name: "custrecord_da_time_sheet_subsidairy",
								label: "Subsidiary"
							}),
							search.createColumn({
								name: "custrecord_da_emp_working_shift",
								label: "Working In"
							})
						]
					});
					var searchResultCount = customrecord_da_shift_time_sheetSearchObj.runPaged().count;
					log.debug("customrecord_da_shift_time_sheetSearchObj result count", searchResultCount);
					customrecord_da_shift_time_sheetSearchObj.run().each(function(result) {
						shiftId = result.getValue('custrecord_da_time_sheet_shift');
						var type = result.getValue('custrecord_da_time_sheet_type');
						if (type == 4) {
							attendanceReportRec.setValue('custrecord_da_atten_report_is_rest_day', true);
						}
						if (type == 2) {
							attendanceReportRec.setValue('custrecord_da_atten_report_day_off', true);
						}
						return true;
					});
					if (shiftId) {
						attendanceReportRec.setValue('custrecord_da_atten_report', shiftId);
					}
					var shiftRec = record.load({
						type: 'customrecord_da_hr_create_shifts',
						id: shiftId
					});
					var shiftInFrom = shiftRec.getText('custrecord_da_shift_in_range_from');
					var shiftInTo = shiftRec.getText('custrecord_da_shift_in_range_to');
					//log.debug('shiftInFrom', shiftInTo);
					var shiftOutFrom = shiftRec.getText('custrecord_da_shift_out_range_from');
					var shiftOutTo = shiftRec.getText('custrecord_da_shift_out_range_to');
					var graceExists = false;
					var gracePeriod = shiftRec.getValue('custrecord_da_shift_ded_start_period');
					if (gracePeriod) {
						graceExists = true;
					} else {
						graceExists = false;
					}
					var customrecord_da_shift_attendnaceSearchObj = search.create({
						type: "customrecord_da_shift_attendnace",
						filters: [
							["custrecord_da_shift_attendance_date", "within", "previousoneday"],
							"AND",
							["custrecord_da_shift_attendance_employee", "anyof", empId],
							"AND",
							["custrecord_da_attenance_in_out", "anyof", "1"],
							"AND",
							[
								["custrecord_da_shift_attendance_time_in", "greaterthan", "12:00 pm"], "AND", ["custrecord_da_shift_attendance_date", "within", "yesterday"], "AND", ["custrecord_da_shift_attendance_time_in", "between", shiftInFrom, shiftInTo]
							]
						],
						columns: [
							search.createColumn({
								name: "scriptid",
								label: "Script ID"
							}),
							search.createColumn({
								name: "custrecord_da_shift_attendance_employee",
								label: "Employee"
							}),
							search.createColumn({
								name: "custrecord_da_shift_att_emp_subsidary",
								label: "Subsidiary"
							}),
							search.createColumn({
								name: "custrecord_da_shift_attendance_date",
								label: "Date"
							}),
							search.createColumn({
								name: "custrecord_da_attenance_in_out",
								label: "In/Out"
							}),
							search.createColumn({
								name: "custrecord_da_shift_attendance_time_in",
								sort: search.Sort.DESC,
								label: "Time"
							}),
							search.createColumn({
								name: "custrecord_da_shift_att_emp_location",
								label: "Location"
							})
						]
					});
					var inSearchResultCount = customrecord_da_shift_attendnaceSearchObj.runPaged().count;
					log.debug("customrecord_da_shift_attendnaceSearchObj result count", searchResultCount);
					customrecord_da_shift_attendnaceSearchObj.run().each(function(result) {
						log.debug('id', result.id);
						attInValue = result.getValue('custrecord_da_shift_attendance_time_in');
						attIn = result.getValue('custrecord_da_shift_attendance_time_in');
						var inLocation = result.getValue('custrecord_da_shift_att_emp_location');
						attendanceReportRec.setValue('custrecord_da_atten_report_in_location', inLocation);
					});
					if (attIn) {
						attIn = format.parse({
							value: attIn,
							type: format.Type.TIMEOFDAY
						});
						log.debug('attIn', attIn);
						attendanceReportRec.setValue('custrecord_da_atten_report_in', attIn);
					}
					var customrecord_da_shift_attendnaceSearchObj = search.create({
						type: "customrecord_da_shift_attendnace",
						filters: [
							["custrecord_da_shift_attendance_date", "within", "previousoneday"],
							"AND",
							["custrecord_da_shift_attendance_employee", "anyof", empId],
							"AND",
							["custrecord_da_attenance_in_out", "anyof", "2"],
							"AND",
							[
								["custrecord_da_shift_attendance_time_in", "lessthan", "12:00 pm"], "AND", ["custrecord_da_shift_attendance_date", "within", "today"], "AND",
								["custrecord_da_shift_attendance_time_in", "between", shiftOutFrom, shiftOutTo]
							]
						],
						columns: [
							search.createColumn({
								name: "scriptid",
								label: "Script ID"
							}),
							search.createColumn({
								name: "custrecord_da_shift_attendance_employee",
								label: "Employee"
							}),
							search.createColumn({
								name: "custrecord_da_shift_att_emp_subsidary",
								label: "Subsidiary"
							}),
							search.createColumn({
								name: "custrecord_da_shift_attendance_date",
								label: "Date"
							}),
							search.createColumn({
								name: "custrecord_da_attenance_in_out",
								label: "In/Out"
							}),
							search.createColumn({
								name: "custrecord_da_shift_attendance_time_in",
								sort: search.Sort.DESC,
								label: "Time"
							}),
							search.createColumn({
								name: "custrecord_da_shift_att_emp_location",
								label: "Location"
							})
						]
					});
					var outSearchResultCount = customrecord_da_shift_attendnaceSearchObj.runPaged().count;
					log.debug("customrecord_da_shift_attendnaceSearchObj result count", searchResultCount);
					customrecord_da_shift_attendnaceSearchObj.run().each(function(result) {
						attOutValue = result.getValue('custrecord_da_shift_attendance_time_in');
						attOut = result.getValue('custrecord_da_shift_attendance_time_in');
						attendanceReportRec.setValue('custrecord_da_atten_report_out_location', result.getValue('custrecord_da_shift_att_emp_location'));
						//return true;
					});
					if (inSearchResultCount == 0 && outSearchResultCount == 0) {
						attendanceReportRec.setValue('custrecord_da_atten_report_is_absent', true);
					}
					if (inSearchResultCount == 0 && outSearchResultCount > 0) {
						attendanceReportRec.setValue('custrecord_da_atten_report_forget_in', true);
					}
					if (inSearchResultCount > 0 && outSearchResultCount == 0) {
						attendanceReportRec.setValue('custrecord_da_atten_report_forget_out', true);
					}
					if (attOut) {
						attOut = format.parse({
							value: attOut,
							type: format.Type.TIMEOFDAY
						});
						log.debug('attOut', attOut);
						attendanceReportRec.setValue('custrecord_da_atten_report_out', attOut);
					}
					//Holidays 
					var customrecord_da_holiday_datesSearchObj = search.create({
						type: "customrecord_da_holiday_dates",
						filters: [
							["custrecord_holiday_date", "within", "yesterday"],
							"AND",
							["custrecord_da_holiday_parent.custrecord_da_holiday_subsidiary", "anyof", SubsidiaryId]
						],
						columns: [
							search.createColumn({
								name: "scriptid",
								sort: search.Sort.ASC,
								label: "Script ID"
							}),
							search.createColumn({
								name: "custrecord_holiday_date",
								label: "Date"
							}),
							search.createColumn({
								name: "custrecord_date_description",
								label: "Description"
							}),
							search.createColumn({
								name: "name",
								join: "CUSTRECORD_DA_HOLIDAY_PARENT",
								label: "Name"
							})
						]
					});
					var searchResultCount = customrecord_da_holiday_datesSearchObj.runPaged().count;
					log.debug("customrecord_da_holiday_datesSearchObj result count", searchResultCount);
					customrecord_da_holiday_datesSearchObj.run().each(function(result) {
						attendanceReportRec.setValue('custrecord_da_atten_report_is_holiday', true);
						attendanceReportRec.setValue('custrecord_da_atten_report_holiday_code', result.getValue({
							name: 'name',
							join: 'CUSTRECORD_DA_HOLIDAY_PARENT'
						}))
						return true;
					});
					//calculate difference of shift
					var shiftIn, shiftOut;
					if (shiftId) {
						shiftIn = shiftRec.getText('custrecord_da_shift_time_in');
						shiftOut = shiftRec.getText('custrecord_da_shift_time_out');
						var shiftOutFrom = shiftRec.getText('custrecord_da_shift_out_range_from');
						var shiftOutTo = shiftRec.getText('custrecord_da_shift_out_range_to');
						log.debug('shiftIn', shiftIn);
						var date1 = new Date("01/01/2001" + " " + shiftIn);
						var date2 = new Date("01/01/2001" + " " + shiftOut);
						if (date2 < date1) {
							date2.setDate(date2.getDate() + 1);
						}
						var diff = date2 - date1;
						var msec = diff;
						var hh = Math.floor(msec / 1000 / 60 / 60);
						msec -= hh * 1000 * 60 * 60;
						var mm = Math.floor(msec / 1000 / 60);
						var mmlength = mm.toString().length;
						var hhlength = hh.toString().length;
						if (mmlength <= 1) {
							mm = '0' + mm;
						}
						if (hhlength <= 1) {
							hh = '0' + hh;
						}
						msec -= mm * 1000 * 60;
						var ss = Math.floor(msec / 1000);
						msec -= ss * 1000;
						var ttime = hh + ":" + mm;
						log.debug('details', hh + "mm" + mm);
						attendanceReportRec.setValue('custrecord_da_attn_report_shift_total_hr', hh + ":" + mm);
						attendanceReportRec.setValue('custrecord_da_shift_total_mins', parseFloat(hh * 60) + parseFloat(mm));
					}
					//calculate difference of attendance
					if (attInValue && attOutValue) {
						log.debug('attInValue', attInValue);
						var date1 = new Date("01/01/2001" + " " + attInValue);
						var date2 = new Date("01/01/2001" + " " + attOutValue);
						if (date2 < date1) {
							date2.setDate(date2.getDate() + 1);
						}
						var diff = date2 - date1;
						var msec = diff;
						var hh = Math.floor(msec / 1000 / 60 / 60);
						msec -= hh * 1000 * 60 * 60;
						var mm = Math.floor(msec / 1000 / 60);
						var mmlength = mm.toString().length;
						var hhlength = hh.toString().length;
						if (mmlength <= 1) {
							mm = '0' + mm;
						}
						if (hhlength <= 1) {
							hh = '0' + hh;
						}
						msec -= mm * 1000 * 60;
						var ss = Math.floor(msec / 1000);
						msec -= ss * 1000;
						var ttime = hh + ":" + mm;
						log.debug('details', hh + "mm" + mm);
						var attendanceTotal = parseFloat(hh * 60) + parseFloat(mm);
						attendanceReportRec.setValue('custrecord_da_atten_report_total', hh + ":" + mm);
						attendanceReportRec.setValue('custrecord_da_attendance_total_in_mins', attendanceTotal);
					};
					if (shiftIn && attInValue) {
						var date1 = new Date("01/01/2001" + " " + shiftIn);
						if (graceExists) {
							var shiftInGrace = shiftRec.getText('custrecord_da_shift_late_in_grace');
							date1 = new Date("01/01/2001" + " " + shiftInGrace);
						}
						var date2 = new Date("01/01/2001" + " " + attInValue);
						if (date2 > date1) {
							var diff = date2 - date1;
							var msec = diff;
							var hh = Math.floor(msec / 1000 / 60 / 60);
							msec -= hh * 1000 * 60 * 60;
							var mm = Math.floor(msec / 1000 / 60);
							var mmlength = mm.toString().length;
							var hhlength = hh.toString().length;
							if (mmlength <= 1) {
								mm = '0' + mm;
							}
							if (hhlength <= 1) {
								hh = '0' + hh;
							}
							msec -= mm * 1000 * 60;
							var ss = Math.floor(msec / 1000);
							msec -= ss * 1000;
							var ttime = hh + ":" + mm;
							var lateIn = parseFloat(hh * 60) + parseFloat(mm);
							attendanceReportRec.setValue('custrecord_da_atten_report_late_in', lateIn);
						}
					}
					if (shiftOut && attOutValue) {
						var date1 = new Date("01/01/2001" + " " + shiftOut);
						if (graceExists) {
							var shiftOutGrace = shiftRec.getText('custrecord_da_shift_early_out_grace');
							date1 = new Date("01/01/2001" + " " + shiftOutGrace);
						}
						var date2 = new Date("01/01/2001" + " " + attOutValue);
						if (date2 < date1) {
							var diff = date1 - date2;
							var msec = diff;
							var hh = Math.floor(msec / 1000 / 60 / 60);
							msec -= hh * 1000 * 60 * 60;
							var mm = Math.floor(msec / 1000 / 60);
							var mmlength = mm.toString().length;
							var hhlength = hh.toString().length;
							if (mmlength <= 1) {
								mm = '0' + mm;
							}
							if (hhlength <= 1) {
								hh = '0' + hh;
							}
							msec -= mm * 1000 * 60;
							var ss = Math.floor(msec / 1000);
							msec -= ss * 1000;
							var ttime = hh + ":" + mm;
							var earlyOut = parseFloat(hh * 60) + parseFloat(mm);
							attendanceReportRec.setValue('custrecord_da_atten_report_early_out', earlyOut);
						}
					}
					//permission 
					var customrecord_da_permissionSearchObj = search.create({
						type: "customrecord_da_permission",
						filters: [
							["custrecord_da_permission_date", "within", "previousoneday"],
							"AND",
							["custrecord_da_permission_employee", "anyof", empId],
							"AND",
							[
								["custrecord_da_permission_from_time", "lessthan", "12:00 pm"], "AND", ["custrecord_da_permission_date", "within", "today"]
							],
							"AND",
							[
								["custrecord_da_permission_from_time", "greaterthan", "12:00 pm"], "AND", ["custrecord_da_permission_date", "within", "yesterday"]
							]
						],
						columns: [
							search.createColumn({
								name: "custrecord_da_permission_employee",
								label: "Employee"
							}),
							search.createColumn({
								name: "custrecord_da_permission_type",
								label: "Permission Type"
							}),
							search.createColumn({
								name: "custrecord_da_permission_date",
								label: "Date"
							}),
							search.createColumn({
								name: "custrecord_da_permission_from_time",
								label: "From Time"
							}),
							search.createColumn({
								name: "custrecord_da_permission_to_time",
								label: "To Time"
							}),
							search.createColumn({
								name: "custrecord_da_permission_total_time",
								label: "Total Time"
							}),
							search.createColumn({
								name: "custrecord_da_permission_approval_status",
								label: "Approval Status"
							})
						]
					});
					var searchResultCount = customrecord_da_permissionSearchObj.runPaged().count;
					log.debug("customrecord_da_permissionSearchObj result count", searchResultCount);
					var totalPermissionHrs = 0;
					var permissionCode = ' ';
					customrecord_da_permissionSearchObj.run().each(function(result) {
						var value = result.getValue('custrecord_da_permission_total_time');
						if (value) {
							var hrs = value.split(':')[0];
							var mns = value.split(':')[1];
							var totalMins = parseFloat(hrs * 60) + parseFloat(mns);
							totalPermissionHrs = parseFloat(totalMins) + parseFloat(totalPermissionHrs);
							permissionCode = result.getText('custrecord_da_permission_type');
						}
						return true;
					});
					if (totalPermissionHrs > 0) {
						attendanceReportRec.setValue('custrecord_da_atten_report_total_permiss', totalPermissionHrs);
						attendanceReportRec.setValue('custrecord_da_atten_report_perm_code', permissionCode);
					}
					//Leaves Checking
					var customrecord_da_leavesSearchObj = search.create({
						type: "customrecord_da_leaves",
						filters: [
							[
								[
									["formulanumeric: {today}-{custrecord_da_leave_start_date}", "greaterthan", "1"], "AND", ["formulanumeric: {custrecord_da_leave_end_date}-{today}", "notlessthan", "0"]
								], "OR", [
									["custrecord_da_leave_start_date", "within", "yesterday"]
								], "OR", [
									["custrecord_da_leave_end_date", "within", "yesterday"]
								]
							],
							"AND",
							["custrecord_da_leave_employee.isinactive", "is", "F"],
							"AND",
							["custrecord_da_leave_employee", "anyof", empId]
						],
						columns: [
							search.createColumn({
								name: "custrecord_da_leave_employee",
								label: "Employee"
							}),
							search.createColumn({
								name: "created",
								label: "Request Date"
							}),
							search.createColumn({
								name: "custrecord_da_leave_type",
								label: "Leave Type"
							}),
							search.createColumn({
								name: "custrecord_da_leave_start_date",
								label: "Leave Start Date"
							}),
							search.createColumn({
								name: "custrecord_da_leave_end_date",
								label: "Leave End Date"
							}),
							search.createColumn({
								name: "custrecord_da_leave_aproval_status",
								label: "Approval Status"
							})
						]
					});
					var searchResultCount = customrecord_da_leavesSearchObj.runPaged().count;
					log.debug("customrecord_da_leavesSearchObj result count", searchResultCount);
					customrecord_da_leavesSearchObj.run().each(function(result) {
						attendanceReportRec.setValue('custrecord_da_atten_report_is_on_leave', true);
						attendanceReportRec.setValue('custrecord_da_atten_report_leave_code', result.getText('custrecord_da_leave_type'));
						return true;
					});
					attendanceReportRec.save();
				} catch (ex) {
					log.error(ex.name, ex.message);
				}
			}

			function diff_months(dt2, dt1) {
				var diff = (dt2.getTime() - dt1.getTime()) / 1000;
				diff /= (60 * 60 * 24 * 7 * 4);
				return Math.abs(Math.round(diff));
			}

			function calculateNoOfFridays(startDate, endDate) {
				//var startDate = new Date("11/01/2019");
				//var endDate = new Date("11/22/2019");
				var totalFridays = 0;
				log.debug(startDate, endDate);
				for (var i = (startDate); i <= (endDate);) {
					if (i.getDay() == 5) {
						totalFridays++;
					}
					i.setTime(i.getTime() + 1000 * 60 * 60 * 24);
				}
				return totalFridays;
			}

			function calculateNoOfSaturdays(startDate, endDate) {
				//var startDate = new Date("11/01/2019");
				//var endDate = new Date("11/22/2019");
				var totalSaturdays = 0;
				log.debug(startDate, endDate);
				for (var i = (startDate); i <= (endDate);) {
					if (i.getDay() == 6) {
						totalSaturdays++;
					}
					i.setTime(i.getTime() + 1000 * 60 * 60 * 24);
				}
				return totalSaturdays;
			}

			function timeConvert(n) {
				var num = n;
				var hours = (num / 60);
				var rhours = Math.floor(hours);
				var minutes = (hours - rhours) * 60;
				var rminutes = Math.round(minutes);
				return rhours + "." + rminutes;
			}

			function daysInMonth(month, year) {
				return new Date(year, month, 0).getDate();
			}

			function convertminutes(hours, minutes) {
				return Number((hours * 60)) + Number(minutes);
			}

			function dateDifference(start, end) {
				log.audit('start0', start + " " + end);
				// Copy date objects so don't modify originals
				var s = new Date(+start);
				var e = new Date(+end);
				log.audit('start1', s + " " + e);
				// Set time to midday to avoid dalight saving and browser quirks
				s.setHours(12, 0, 0, 0);
				e.setHours(12, 0, 0, 0);
				// Get the difference in whole days
				var totalDays = Math.round((e - s) / 8.64e7);
				// Get the difference in whole weeks
				var wholeWeeks = totalDays / 7 | 0;
				// Estimate business days as number of whole weeks * 5
				var days = wholeWeeks * 6;
				// If not even number of weeks, calc remaining weekend days
				if (totalDays % 7) {
					s.setDate(s.getDate() + wholeWeeks * 7);
					while (s < e) {
						s.setDate(s.getDate() + 1);
						// If day isn't a Sunday or Saturday, add to business days
						if (s.getDay() != 5) {
							++days;
						}
					}
				}
				return days + 1;
			}
			/**
			 * Executes when the summarize entry point is triggered and applies to the result set.
			 *
			 * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
			 * @since 2015.1
			 */
			function summarize(summary) {
				try {} catch (ex) {
					log.error(ex.name, ex.message);
				}
			}

			function removeDuplicateUsingFilter(arr) {
				var unique_array = arr.filter(function(elem, index, self) {
					return index == self.indexOf(elem);
				});
				return unique_array;
			}
			return {
				getInputData: getInputData,
				map: map,
				reduce: reduce,
				summarize: summarize
			};
		});