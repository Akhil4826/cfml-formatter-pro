
import { type FormatOptions } from './types';

export const DEFAULT_OPTIONS: FormatOptions = {
  tabWidth: 4,
  useTabs: false,
  quoteStyle: 'double',
  formatSql: true,
  attributeThreshold: 3,
  pascalCaseBuiltInFunctions: true,
  preferNewOverCreateObject: true,
};

export const DEFAULT_CFML_CODE = `
<cfcomponent output="false" hint="User Service Component">
<cffunction name="getUserProfile" access="remote" returnType="struct" hint="Gets a user profile by their unique ID.">
<cfargument name="userID" type="numeric" required="true">
<cfset var local = {}>
<!--- get user from database using a complex query --->
<cfquery name="local.qUser" dataSource="myDSN">
SELECT u.firstName, u.lastName, u.email, p.profileData, p.lastUpdated, (SELECT COUNT(*) FROM orders o WHERE o.userID = u.userID) as orderCount FROM users u LEFT JOIN profiles p ON u.userID = p.userID WHERE u.userID = <cfqueryparam value="#arguments.userID#" cfsqltype="cf_sql_integer"> AND u.isActive = 1
</cfquery>
<cfif local.qUser.recordCount>
<cfset local.stUser = {
firstName = local.qUser.firstName,
lastName = local.qUser.lastName
}>
<cfscript>
// Some CFScript logic here
local.utils = createObject("component", "com.utils.FormattingUtils");
local.stUser.fullName = local.utils.getFullName(local.qUser.firstName, local.qUser.lastName);
WriteOutput("Processing user: " & local.stUser.fullName);
</cfscript>
<cfreturn local.stUser>
<cfelseif (isdefined("someOtherCondition") AND someOtherCondition IS TRUE)>
<cfreturn {error="Condition met"}>
<cfelse>
<!--- User not found, return empty --->
<cfreturn {}>
</cfif>
</cffunction>
<cffunction name="updateUser" access="private" returntype="void">
<p>This is an <b>HTML</b> block inside CFML.</p>
<cfset var someValue = true/>
<cfset myArr = ["one", "two", "three"]>
<cfloop array="#myArr#" index="i">
<cfoutput>#i#</cfoutput>
</cfloop>
</cffunction>
</cfcomponent>
`;
