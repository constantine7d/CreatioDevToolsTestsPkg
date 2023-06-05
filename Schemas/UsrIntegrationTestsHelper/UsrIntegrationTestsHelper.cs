namespace Terrasoft.Configuration.UsrDevTools.Tests
{

	using System;
	using System.Collections.Generic;
	using System.Linq;
	using System.Reflection;
	using System.Runtime.Serialization;
	using System.Text;
	using Terrasoft.Core;
	using Terrasoft.Core.Factories;
	using Xunit;
	using Xunit.Sdk;


	#region Class: UsrIntegrationTestsHelper
	/// <summary>
	/// Хелпер для интеграционного тестирвоания <see cref="UsrIntegrationTestsHelper">
	/// </summary>
	public class UsrIntegrationTestsHelper
	{
		#region Properties: Public

		/// <summary>
		/// Активное подключение
		/// </summary>
		public UserConnection UserConnection { get; }

		#endregion

		#region Constructors

		/// <summary>
		/// Инициализация <see cref="UsrIntegrationTestsHelper"/>.
		/// </summary>
		/// <param name="userConnection">Активное подключение</param>
		public UsrIntegrationTestsHelper(UserConnection userConnection)
		{
			UserConnection = userConnection ?? throw new ArgumentNullException(nameof(userConnection));
		}

		#endregion

		#region Properties: Private

		private UsrReflectionHelper _ReflectionHelper;

		private UsrReflectionHelper ReflectionHelper
		{
			get
			{
				_ReflectionHelper = _ReflectionHelper ?? ClassFactory.Get<UsrReflectionHelper>(new ConstructorArgument("userConnection", UserConnection));
				return _ReflectionHelper;
			}
		}

		#endregion

		#region Methods: Private

		private IEnumerable<Type> GetTestClasses()
		{
			return Assembly.GetExecutingAssembly().GetTypes().Where(type => type.IsSubclassOf(typeof(Test)));
		}

		private string GetDisplayValue(MethodInfo method, object[] data)
		{
			StringBuilder builder = new StringBuilder();
			//builder.Append($"{method.Name}(");
			var parameters = method.GetParameters();
			var index = 0;
			foreach (var param in parameters)
			{
				if (index > 0)
				{
					builder.Append(", ");
				}
				if (data is null)
				{
					builder.Append($"{param.Name}: null");
				}
				else
				{
					builder.Append($"{param.Name}: {data[index]}");
				}
				index++;
			}
			//builder.Append(')');
			return builder.ToString();
		}

		private void InitTheories(TestConfig test, MethodInfo method)
		{
			var theoriesData = method.GetCustomAttributes<Xunit.InlineDataAttribute>(true);
			int index = 0;
			test.Theories = test.Theories ?? new List<TestConfigTheory>();
			foreach (var theoryData in theoriesData)
			{
				var data = theoryData.GetData(method).FirstOrDefault();
				test.Theories.Add(new TestConfigTheory
				{
					Index = index,
					DisplayValue = GetDisplayValue(method, data),
					Data = data
				});
				index++;
			}
		}

		private IEnumerable<TestConfig> GetTestsForClass(Type type)
		{
			var result = new List<TestConfig>();
			object[] attributes;
			foreach (var method in type.GetMethods())
			{
				attributes = method.GetCustomAttributes(typeof(TheoryAttribute), false);
				if (attributes.Length > 0)
				{
					var test = new TestConfig
					{
						Name = method.Name,
						ClassName = type.Name,
						Namespace = type.Namespace,
						IsTheory = true
					};
					result.Add(test);
					InitTheories(test, method);
					continue;
				}
				attributes = method.GetCustomAttributes(typeof(FactAttribute), false);
				if (attributes.Length > 0)
				{
					result.Add(new TestConfig
					{
						Name = method.Name,
						ClassName = type.Name,
						Namespace = type.Namespace
					});
				}
			}
			return result;
		}

		private Type GetTestClass(string className, string namespaceName)
		{
			var fullType = $"{namespaceName}.{className}";
			var type = Type.GetType(fullType);
			if (type == null)
			{
				throw new Exception($"{fullType} not found");
			}
			if (!type.IsClass)
			{
				throw new Exception($"{fullType} not a class");
			}
			return type;
		}



		private FactTestResult RunTest(Type type, Test test, TestConfig testConfig, bool arrange = false)
		{
			try
			{
				if (arrange)
				{
					test.UserConnection = UserConnection;
					test.Arrange();
				}
				if (testConfig.IsTheory)
				{
					return TestTheories(type, test, testConfig);
				}
				object result = ReflectionHelper.InvokeMethod(type, testConfig.Name, test);
				return FactTestResult.Successful(result?.ToString(), testConfig);
			}
			catch (XunitException ex)
			{
				return FactTestResult.Error($"{ex.Message}. ({ex.StackTrace})", testConfig);
			}
			catch (TargetInvocationException ex)
			{
				return FactTestResult.Error(ex.InnerException, testConfig);
			}
			catch (Exception ex)
			{
				return FactTestResult.Error(ex, testConfig);
			}
		}

		private FactTestResult TestTheories(Type type, Test test, TestConfig testConfig)
		{
			var method = ReflectionHelper.GetMethod(type, testConfig.Name);
			if (!testConfig.Theories?.Any() ?? true)
			{
				InitTheories(testConfig, method);
			}
			bool isAllSuccess = true;
			foreach (var theory in testConfig.Theories)
			{
				try
				{
					var parameters = new Dictionary<string, object>();
					ParameterInfo[] parameterInfos = method.GetParameters();
					int index = 0;
					foreach (var parameter in parameterInfos)
					{
						if (theory.Data is null)
						{
							parameters.Add(parameter.Name, null);
						}
						else
						{
							parameters.Add(parameter.Name, theory.Data[index]);
						}
						index++;
					}
					var result = ReflectionHelper.InvokeMethod(type, testConfig.Name, test, parameters);
					theory.TestResult = TestResult.Successful(result?.ToString());
				}
				catch (TargetInvocationException ex)
				{
					isAllSuccess = false;
					theory.TestResult = TestResult.Error(ex.InnerException);
				}
				catch (Exception ex)
				{
					isAllSuccess = false;
					theory.TestResult = TestResult.Error(ex);
				}
			}
			return isAllSuccess ? FactTestResult.Successful(testConfig) : FactTestResult.Error("Check theories", testConfig);
		}

		#endregion


		#region Methods: Public

		internal IEnumerable<TestConfig> GetTests()
		{
			var result = new List<TestConfig>();
			var testClasses = GetTestClasses();
			foreach (var type in testClasses)
			{
				result.AddRange(GetTestsForClass(type));
			}
			return result;
		}

		internal FactTestResult RunTest(TestConfig testConfig)
		{
			var type = GetTestClass(testConfig.ClassName, testConfig.Namespace);
			var test = ReflectionHelper.GetClassInstanse(type) as Test;
			return RunTest(type, test, testConfig, true);
		}

		internal FactTestResult RunTheory(TestConfig testConfig, int theoryIndex)
		{
			var type = GetTestClass(testConfig.ClassName, testConfig.Namespace);
			var test = ReflectionHelper.GetClassInstanse(type) as Test;
			return RunTest(type, test, testConfig, true);
		}

		internal IEnumerable<FactTestResult> RunTestsForClass(string className, string namespaceName)
		{
			var result = new List<FactTestResult>();
			var type = GetTestClass(className, namespaceName);
			var test = ReflectionHelper.GetClassInstanse(type) as Test;
			test.UserConnection = UserConnection;
			test.Arrange();
			var testsConfigs = GetTestsForClass(type);
			foreach (var testConfig in testsConfigs)
			{
				result.Add(RunTest(type, test, testConfig));
			}
			return result;
		}

		internal IEnumerable<FactTestResult> RunTestsForNamespace(string namespaceName)
		{
			var result = new List<FactTestResult>();
			var clasesInNamespaces = GetTestClasses().Where(it => it.Namespace == namespaceName);
			foreach (var classInNamespace in clasesInNamespaces)
			{
				result.AddRange(RunTestsForClass(classInNamespace.Name, namespaceName));
			}
			return result;
		}

		#endregion
	}

	#endregion

	#region Class: TestConfigTheory

	[DataContract]
	public class TestConfigTheory
	{
		[DataMember]
		public int Index { get; set; }

		[DataMember]
		public string DisplayValue { get; set; }

		[DataMember]
		public object[] Data { get; set; }

		[DataMember]
		public TestResult TestResult { get; set; }

	}

	#endregion

	#region Class: TestConfig

	[DataContract]
	public class TestConfig
	{
		[DataMember]
		public string Name { get; set; }

		[DataMember]
		public string ClassName { get; set; }

		[DataMember]
		public string Namespace { get; set; }

		[DataMember]
		public bool IsTheory { get; set; }

		[DataMember]
		public List<TestConfigTheory> Theories { get; set; } = new List<TestConfigTheory>();

		public TestConfig()
		{

		}

	}

	#endregion

	#region Class: FactTestResult

	/// <summary>
	///  <see cref="FactTestResult">
	/// </summary>
	[DataContract]
	public class FactTestResult : TestResult
	{
		[DataMember]
		public TestConfig Test { get; set; }

		public static FactTestResult Successful(TestConfig testConfig)
		{
			return new FactTestResult()
			{
				Success = true,
				Test = testConfig
			};
		}

		public static FactTestResult Successful(string message, TestConfig testConfig)
		{
			return new FactTestResult()
			{
				Success = true,
				Message = message,
				Test = testConfig
			};
		}

		public static FactTestResult Error(string message, TestConfig testConfig)
		{
			return new FactTestResult()
			{
				Success = false,
				ErrorInfo = new ErrorInfo(message),
				Test = testConfig
			};
		}

		public static FactTestResult Error(Exception ex, TestConfig testConfig)
		{
			return new FactTestResult()
			{
				Success = false,
				ErrorInfo = new ErrorInfo(ex),
				Test = testConfig
			};
		}
	}

	#endregion

	#region Class: TheoryTestResult

	/// <summary>
	///  <see cref="TheoryTestResult">
	/// </summary>
	[DataContract]
	public class TheoryTestResult : TestResult
	{

	}

	#endregion

	#region Class: TestResult

	/// <summary>
	///  <see cref="TestResult">
	/// </summary>
	[DataContract]
	public class TestResult
	{

		[DataMember]
		public bool Success { get; set; }

		[DataMember]
		public string Message { get; set; }

		[DataMember]
		public ErrorInfo ErrorInfo { get; set; }

		public static TestResult Successful()
		{
			return new TestResult()
			{
				Success = true
			};
		}

		public static TestResult Successful(string message)
		{
			return new TestResult()
			{
				Success = true,
				Message = message
			};
		}

		public static TestResult Error(string message)
		{
			return new TestResult()
			{
				Success = false,
				ErrorInfo = new ErrorInfo(message)
			};
		}

		public static TestResult Error(Exception ex)
		{
			return new TestResult()
			{
				Success = false,
				ErrorInfo = new ErrorInfo(ex)
			};
		}
	}

	#endregion

	#region Class: ErrorInfo

	/// <summary>
	///  <see cref="ErrorInfo">
	/// </summary>
	[DataContract]
	public class ErrorInfo
	{

		[DataMember]
		public string Message { get; set; }

		[DataMember]
		public string StackTrace { get; set; }

		public ErrorInfo(string message)
		{
			Message = message;
		}

		public ErrorInfo(Exception ex)
		{
			Message = ex.Message;
			StackTrace = ex.StackTrace;
		}

	}

	#endregion

	#region Class: Test

	/// <summary>
	///  <see cref="Test">
	/// </summary>
	public abstract class Test
	{
		#region Fields



		#endregion

		#region Properties

		/// <summary>
		/// Активное подключение
		/// </summary>
		public UserConnection UserConnection { get; set; }

		#endregion

		#region Methods: Private



		#endregion

		#region Methods: Public

		/// <summary>
		/// Arange test data. Abstract - no need to base call
		/// </summary>
		public virtual void Arrange()
		{
			//Abstract
		}

		#endregion
	}

	#endregion

}