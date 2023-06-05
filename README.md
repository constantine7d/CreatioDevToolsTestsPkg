# CreatioDevToolsTestsPkg

It's alfa version. 

## Dependencies

Install [CreatioDevToolsPkg](https://github.com/constantine7d/CreatioDevToolsPkg) package.

## Install

Use [clio](https://github.com/Advance-Technologies-Foundation/clio) tool for installation. 
- Compress pkg `clio generate-pkg-zip . -d .\UsrDevToolsTests.gz` or use UsrDevToolsTests.gz from repository.
- Use clio for install or install it manualy.



## Use

Open module page from navigation panel or go to http://siteaddress/0/Nui/ViewModule.aspx#UsrIntegrationTestsModule

### Backend tests

- Create pkg Something.Tests
- Add Source code schema
- Create class wich extends Terrasoft.Configuration.UsrDevTools.Tests.Test class and use xUnit attributes to write tests.