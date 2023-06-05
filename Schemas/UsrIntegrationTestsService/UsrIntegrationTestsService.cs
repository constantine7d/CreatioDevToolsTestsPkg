namespace Terrasoft.Configuration.UsrDevTools.Tests
{
	using System;
	using System.Collections.Generic;
	using System.Runtime.Serialization;
	using System.ServiceModel;
	using System.ServiceModel.Activation;
	using System.ServiceModel.Web;
	using Terrasoft.Core.Factories;
	using Terrasoft.Web.Common;
	using Terrasoft.Web.Common.ServiceRouting;

	#region Class: CompletenessServiceResponse

	[DataContract]
	public class GetTestsResponse : ConfigurationServiceResponse
	{

		[DataMember(Name = "TestsConfigs")]
		public IEnumerable<TestConfig> TestsConfigs { get; set; }
		public GetTestsResponse(IEnumerable<TestConfig> testsConfigs) : base()
		{
			TestsConfigs = testsConfigs;
		}

		public GetTestsResponse(Exception e) : base(e)
		{
		}
	}

	#endregion


	/// <summary>
	/// Сервис для интеграционного тестирвоания <see cref="UsrIntegrationTests">
	/// </summary>
	[ServiceContract]
	[DefaultServiceRoute]
	[SspServiceRoute]
	[AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Required)]
	public class UsrIntegrationTestsService : BaseService
	{

		#region Properties: Private

		private UsrIntegrationTestsHelper Helper
		{
			get
			{
				return ClassFactory.Get<UsrIntegrationTestsHelper>(new ConstructorArgument("userConnection", UserConnection));
			}
		}

		#endregion

		#region Methods: Public

		[OperationContract]
		[WebInvoke(Method = "POST", BodyStyle = WebMessageBodyStyle.Wrapped,
			RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
		public GetTestsResponse GetTests()
		{
			try
			{
				return new GetTestsResponse(Helper.GetTests());
			}
			catch (Exception e)
			{
				return new GetTestsResponse(e);
			}
		}

		[OperationContract]
		[WebInvoke(Method = "POST", BodyStyle = WebMessageBodyStyle.Wrapped,
			RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
		public FactTestResult RunTest(TestConfig test)
		{
			return Helper.RunTest(test);
		}

		[OperationContract]
		[WebInvoke(Method = "POST", BodyStyle = WebMessageBodyStyle.Wrapped,
			RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
		public FactTestResult RunTheory(TestConfig test, int theoryIndex)
		{
			return Helper.RunTheory(test, theoryIndex);
		}

		[OperationContract]
		[WebInvoke(Method = "POST", BodyStyle = WebMessageBodyStyle.Wrapped,
			RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
		public IEnumerable<FactTestResult> RunTestsForClass(string className, string namespaceName)
		{
			return Helper.RunTestsForClass(className, namespaceName);
		}

		[OperationContract]
		[WebInvoke(Method = "POST", BodyStyle = WebMessageBodyStyle.Wrapped,
			RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
		public IEnumerable<FactTestResult> RunTestsForNamespace(string namespaceName)
		{
			return Helper.RunTestsForNamespace(namespaceName);
		}

		#endregion

	}

}