define("UsrIntegrationTestsPage", ["UsrDevHelpersUtilsJs"], function (DevHelpersUtils) {
	return {
		messages: {},
		diff: /**SCHEMA_DIFF*/ [
			{
				"operation": "insert",
				"name": "ModulePageContainer",
				"propertyName": "items",
				"values": {
					"id": "IntegrationTestsPageContainer",
					"itemType": this.Terrasoft.ViewItemType.CONTAINER,
					"items": [],
					"wrapClass": ["header-container-margin-bottom", "usr-top-container"]
				}
			},
			{
				"operation": "insert",
				"name": "PublishButtonContainer",
				"propertyName": "items",
				"parentName": "ModulePageContainer",
				"values": {
					"itemType": this.Terrasoft.ViewItemType.CONTAINER,
					"items": [],
					"wrapClass": ["publishButton"]
				}
			},
			{
				"operation": "insert",
				"name": "ReloadButton",
				"propertyName": "items",
				"parentName": "PublishButtonContainer",
				"values": {
					"itemType": this.Terrasoft.ViewItemType.BUTTON,
					"style": this.Terrasoft.controls.ButtonEnums.style.BLUE,
					"caption": "Reload", //{ "bindTo": "Resources.Strings.PublishButtonCaption" },
					"click": {
						"bindTo": "onReloadButtonClick"
					}
				}
			},
			{
				"operation": "insert",
				"name": "GridContainer",
				"propertyName": "items",
				"parentName": "ModulePageContainer",
				"values": {
					"itemType": this.Terrasoft.ViewItemType.CONTAINER,
					"items": [],
					"wrapClass": ["gridContainer"]
				}
			},
			{
				"operation": "insert",
				"name": "DataGrid",
				"parentName": "GridContainer",
				"propertyName": "items",
				"values": {
					safeBind: true,
					itemType: Terrasoft.ViewItemType.GRID,
					listedZebra: true,
					collection: { "bindTo": "TestsGridData" },
					activeRow: { "bindTo": "ActiveRow" },
					activeRowAction: { "bindTo": "onActiveRowAction" },
					activeRowActions: [
						{
							className: "Terrasoft.Button",
							style: Terrasoft.controls.ButtonEnums.style.BLUE,
							caption: "Run",
							tag: "runTest"
						}
					],
					primaryColumnName: "Id",
					//"isEmpty": { "bindTo": "IsGridEmpty" },
					//"isLoading": { "bindTo": "IsGridLoading" },
					//"multiSelect": { "bindTo": "MultiSelect" },
					selectedRows: { "bindTo": "SelectedRows" },
					//"sortColumn": { "bindTo": "sortColumn" },
					//"sortColumnDirection": { "bindTo": "GridSortDirection" },
					//"sortColumnIndex": { "bindTo": "SortColumnIndex" },
					//"linkClick": { "bindTo": "linkClicked" }

					type: "listed",
					captionsConfig: [
						{
							cols: 10,
							name: "Test"
						},
						{
							cols: 2,
							name: "Success"
						},
						{
							cols: 12,
							name: "Message"
						}
					],
					columnsConfig: [
						{
							cols: 10,
							key: [
								{
									name: {
										bindTo: "Name"
									}
								}
							]
						},
						{
							cols: 2,
							key: [
								{
									name: {
										bindTo: "SuccessDisplayValue"
									}
								}
							]
						},
						{
							cols: 12,
							key: [
								{
									name: {
										bindTo: "Message"
									}
								}
							]
						}
					],
					hierarchical: true,
					hierarchicalColumnName: "Parent",
					expandHierarchyLevels: { "bindTo": "ExpandHierarchyLevels" },
					updateExpandHierarchyLevels: { "bindTo": "onExpandHierarchyLevels" },
					autoExpandHierarchyLevels: true
				}
			}
		] /**SCHEMA_DIFF*/,
		attributes: {
			/**
			 * Publish message enabled flag.
			 */
			"IsPublishButtonEnabled": {
				dataValueType: this.Terrasoft.DataValueType.BOOLEAN
			},
			/**
			 * Publish button hint.
			 */
			"PublishButtonHint": {
				dataValueType: this.Terrasoft.DataValueType.TEXT
			},

			/**
			 * Collection of the menu items.
			 * @type {Terrasoft.ObjectCollection}
			 */
			"TestsGridData": {
				dataValueType: Terrasoft.DataValueType.COLLECTION
			},
			"SelectedRows": {
				dataValueType: Terrasoft.DataValueType.COLLECTION
			},
			"ActiveRow": {
				dataValueType: Terrasoft.DataValueType.TEXT
			},
			/**
			 * List of expand hierarchy levels folder.
			 */
			"ExpandHierarchyLevels": {
				dataValueType: Terrasoft.DataValueType.COLLECTION
			},
			"TestsResponseCollection": {
				dataValueType: Terrasoft.DataValueType.COLLECTION
			}
		},
		methods: {
			/**
			 * @inheritdoc Terrasoft.BaseSchemaModule#init
			 * @overridden
			 */
			init: function () {
				this.callParent(arguments);
				this.initGridData();
				this.set("SelectedRows", Ext.create("Terrasoft.BaseViewModelCollection"));
				this.set("ExpandHierarchyLevels", []);
				this.set(
					"TestsResponseCollection",
					Ext.create("Terrasoft.BaseViewModelCollection")
				);
			},

			/**
			 * Executes when view was rendered.
			 * @overridden
			 * @protected
			 */
			onRender: function () {
				this.callParent(arguments);
				this.loadTestData();
			},

			addTest: function (columnValues, dataCollection) {
				const row = this.createRowViewModel(columnValues);
				dataCollection.add(row.get("Id"), row);
			},

			getColumns: function () {
				return {
					Id: {
						dataValueType: Terrasoft.DataValueType.TEXT
					},
					Parent: {
						dataValueType: Terrasoft.DataValueType.TEXT
					},
					Name: {
						dataValueType: Terrasoft.DataValueType.TEXT
					},
					MethodName: {
						dataValueType: Terrasoft.DataValueType.TEXT
					},
					ClassName: {
						dataValueType: Terrasoft.DataValueType.TEXT
					},
					Namespace: {
						dataValueType: Terrasoft.DataValueType.TEXT
					},
					Type: {
						dataValueType: Terrasoft.DataValueType.TEXT
					},
					Success: {
						dataValueType: Terrasoft.DataValueType.BOOLEAN
					},
					SuccessDisplayValue: {
						dataValueType: Terrasoft.DataValueType.TEXT
					},
					Message: {
						dataValueType: Terrasoft.DataValueType.TEXT
					},
					Theories: {
						dataValueType: Terrasoft.DataValueType.COLLECTION
					},
					TheoryIndex: {
						dataValueType: Terrasoft.DataValueType.INTEGER
					}
				};
			},

			createRowViewModel: function (columnValues) {
				const viewModel = Ext.create("Terrasoft.BaseViewModel", {
					columns: this.getColumns(),
					values: {
						Id: columnValues.Id || this.getId(columnValues),
						Parent: columnValues.Parent || "",
						Name: columnValues.Name,
						MethodName: columnValues.Name,
						ClassName: columnValues.ClassName,
						Namespace: columnValues.Namespace,
						Type: columnValues.Type || "",
						Success: columnValues.Success || false,
						SuccessDisplayValue: "",
						Message: columnValues.Message || "",
						Theories: columnValues.Theories || [],
						TheoryIndex: columnValues.TheoryIndex || 0
					}
				});
				viewModel.sandbox = this.sandbox;
				viewModel.set("HasNesting", columnValues.HasNesting || 0);
				return viewModel;
			},

			getId: function (test, type) {
				type = type || test.Type || "Test";
				switch (type) {
					case "Test":
						return test.Namespace + "." + test.ClassName + "." + test.Name;
					case "Class":
						return test.Namespace + "." + test.ClassName;
					case "Namespace":
						return test.Namespace;
					default:
						throw new Error("Unknown type " + type);
				}
			},

			callService: async function (methodName, data) {
				const result = await DevHelpersUtils.callService(
					"UsrIntegrationTestsService",
					methodName,
					this,
					data
				);
				if (!result.hasOwnProperty("success") || result.success) {
					return result;
				} else {
					this.showInformationDialog(result.errorInfo.message);
					console.error(result.errorInfo);
					this.hideBodyMask();
					throw new Error("Error in service method " + methodName);
				}
			},

			prepareHierarchy: function () {
				const tests = this.get("TestsResponseCollection");
				this.Terrasoft.each(tests.getItems(), item => {
					const classId = this.getId(item.values, "Class");
					const namespaceId = this.getId(item.values, "Namespace");
					item.$Parent = classId;
					item.$Type = "Test";
					if (item.$Theories.length > 0) {
						item.$HasNesting = item.$Theories.length;
						item.$Theories.forEach(theory => {
							this.addTest(
								{
									Id: item.$Id + "." + theory.Index,
									HasNesting: 0,
									Type: "Theory",
									Name: theory.DisplayValue,
									TheoryIndex: theory.Index,
									MethodName: item.$Name,
									ClassName: item.$ClassName,
									Namespace: item.$Namespace,
									Parent: item.$Id
								},
								tests
							);
						});
					}
					if (!tests.findByAttr("Id", classId)) {
						this.addTest(
							{
								Id: classId,
								HasNesting: 1,
								Type: "Class",
								Name: item.$ClassName,
								ClassName: item.$ClassName,
								Namespace: item.$Namespace,
								Parent: namespaceId
							},
							tests
						);
					}
					if (!tests.findByAttr("Id", namespaceId)) {
						this.addTest(
							{
								Id: namespaceId,
								HasNesting: 1,
								Type: "Namespace",
								Name: item.$Namespace,
								Namespace: item.$Namespace
							},
							tests
						);
					}
				});
			},

			loadTestData: async function () {
				this.showBodyMask();
				const testsConfigs = (await this.callService("GetTests")).TestsConfigs;
				const tests = this.get("TestsResponseCollection");
				tests.clear();
				Terrasoft.each(testsConfigs, item => {
					this.addTest(item, tests);
				});
				this.prepareHierarchy();
				this.loadHeadItems();
				this.hideBodyMask();
			},

			loadHeadItems: function () {
				const gridData = this.getGridData();
				gridData.clear();
				this.$SelectedRows.clear();
				const tests = this.get("TestsResponseCollection");
				const collection = this.Ext.create("Terrasoft.BaseViewModelCollection");
				this.Terrasoft.each(
					tests.getItems(),
					function (item) {
						if (!item.get("Parent")) {
							collection.add(item.get("Id"), item);
						}
					},
					this
				);
				this.addItemsToGridData(collection);
				this.Terrasoft.each(collection.getItems(), item => {
					this.expandHierarchy(item.get("Id"));
				});
			},

			initGridData: function () {
				const gridData = Ext.create("Terrasoft.BaseViewModelCollection");
				this.set("TestsGridData", gridData);
				//gridData.on("dataLoaded", this.onGridLoaded, this);
			},

			getCurrentGrid: function () {
				return Ext.getCmp(this.name + "DataGridGrid");
			},

			onActiveRowAction: function (actionName, recordId) {
				if (actionName === "runTest") {
					this.runTest(recordId);
				}
			},

			getSuccessDisplayValue: function (success) {
				return success ? "+" : "-";
			},

			runTest: async function (recordId) {
				this.showBodyMask();
				const activeRow = this.getGridData().get(recordId);
				let serviceName = "";
				const serviceData = {};
				switch (activeRow.$Type) {
					case "Test":
						if (activeRow.$Theories.length > 0) {
							this.expandHierarchy(activeRow.$Id);
						}
						serviceName = "RunTest";
						serviceData.test = {
							Name: activeRow.get("Name"),
							ClassName: activeRow.get("ClassName"),
							Namespace: activeRow.get("Namespace"),
							IsTheory: activeRow.$Theories.length > 0
						};
						break;
					case "Theory":
						const test = this.getGridData().get(activeRow.$Parent);
						serviceName = "RunTheory";
						serviceData.test = {
							Name: test.get("Name"),
							ClassName: test.get("ClassName"),
							Namespace: test.get("Namespace"),
							IsTheory: true
						};
						serviceData.theoryIndex = activeRow.get("TheoryIndex");
						break;
					case "Class":
						this.expandHierarchy(activeRow.$Id);
						serviceName = "RunTestsForClass";
						serviceData.className = activeRow.get("ClassName");
						serviceData.namespaceName = activeRow.get("Namespace");
						break;
					case "Namespace":
						this.expandHierarchy(activeRow.$Id);
						serviceName = "RunTestsForNamespace";
						serviceData.namespaceName = activeRow.get("Namespace");
						const gridData = this.getGridData();
						this.Terrasoft.each(gridData, item => {
							if (item.$Parent === activeRow.$Id) {
								this.expandHierarchy(item.$Id);
							}
						});
						break;
				}
				const result = await this.callService(serviceName, serviceData);
				if (result instanceof Array) {
					result.forEach(element => {
						this.setTestResult(element);
					});
				} else {
					this.setTestResult(result);
				}
				this.hideBodyMask();
			},

			setRowTestResult: function (row, testResult) {
				row.$Success = testResult.Success;
				row.$SuccessDisplayValue = this.getSuccessDisplayValue(testResult.Success);
				if (testResult.Success) {
					row.$Message = testResult.Message || "";
					//Terrasoft.showMessage(result.Message || "Success");
				} else {
					row.$Message =
						testResult.ErrorInfo.Message +
						"\n" +
						(testResult.ErrorInfo.StackTrace || "");
					//Terrasoft.showErrorMessage(result.ErrorInfo.Message);
					//console.error(result.ErrorInfo);
				}
			},

			setTestResult: function (testResult) {
				const gridData = this.getGridData();
				const row = gridData.get(this.getId(testResult.Test));
				this.setRowTestResult(row, testResult);
				const theories = testResult.Test.Theories;
				if (!theories || theories.length === 0) {
					return;
				}
				this.expandHierarchy(row.$Id);
				theories.forEach(theory => {
					const theoryRow = this.getGridData().firstOrDefault(item => {
						return item.$Parent === row.$Id && item.$TheoryIndex === theory.Index;
					});
					this.setRowTestResult(theoryRow, theory.TestResult);
				});
			},

			getGridData: function () {
				return this.get("TestsGridData");
			},

			onReloadButtonClick: function () {
				this.deExpandHierarchy();
				this.loadTestData();
			},

			expandHierarchy: function (rowId) {
				if (this.$ExpandHierarchyLevels.includes(rowId)) {
					return;
				}
				const elementId = this.name + "DataGridGrid-toggle-" + rowId;
				document.getElementById(elementId).click();
			},

			deExpandHierarchy: function () {
				this.$ExpandHierarchyLevels
					.slice()
					.reverse()
					.forEach(rowId => {
						const elementId = this.name + "DataGridGrid-toggle-" + rowId;
						document.getElementById(elementId).click();
					});
			},

			loadChildItems: function (itemKey, callback, isSilentMode) {
				const gridData = this.getGridData();
				const tests = this.get("TestsResponseCollection");
				const collection = this.Ext.create("Terrasoft.BaseViewModelCollection");
				this.Terrasoft.each(tests.getItems(), item => {
					if (item.get("Parent") === itemKey && !gridData.contains(item.get("Id"))) {
						//item.set("HasNesting", 1);
						collection.add(item.get("Id"), item);
					}
				});
				this.addItemsToGridData(collection, {
					mode: "child",
					target: itemKey
				});
			},

			addItemsToGridData: function (collection, options) {
				if (collection.getCount() === 0) {
					return;
				}
				const gridData = this.getGridData();
				gridData.loadAll(collection, options);
			},

			onExpandHierarchyLevels: function (itemKey, expanded, callback, isSilentMode) {
				this.loadChildItems(itemKey, callback, isSilentMode);
			}
		}
	};
});
