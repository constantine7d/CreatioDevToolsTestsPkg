define("UsrIntegrationTestsModule", ["UsrDevelopingHelpersImages", "BaseSchemaModuleV2"], function (DevelopingHelpersImages) {
	Ext.define("Terrasoft.configuration.UsrIntegrationTestsModule", {
		extend: "Terrasoft.BaseSchemaModule",
		alternateClassName: "Terrasoft.UsrIntegrationTestsModule",

		/**
		 * @inheritdoc Terrasoft.BaseSchemaModule#generateViewContainerId
		 * @overridden
		 */
		generateViewContainerId: false,

		/**
		 * @inheritdoc Terrasoft.BaseSchemaModule#initSchemaName
		 * @overridden
		 */
		initSchemaName: function () {
			this.schemaName = "UsrIntegrationTestsPage";
		},

		/**
		 * @inheritdoc Terrasoft.BaseSchemaModule#initHistoryState
		 * @overridden
		 */
		initHistoryState: Terrasoft.emptyFn,

		/**
		 * @inheritdoc
		 * @overridden
		 */
		init: function () {
			this.callParent(arguments);
			this.changeDocumentTitle();
		},

		changeDocumentTitle: function () {
			document.title = "Integration Tests";
			let link = document.querySelector("link[rel~='icon']");
			if (!link) {
				link = document.createElement("link");
				link.rel = "icon";
				document.getElementsByTagName("head")[0].appendChild(link);
			}
			link.href = DevelopingHelpersImages.FavIcon;
		}
	});
	return this.Terrasoft.UsrIntegrationTestsModule;
});
