/*\
title: $:/core/modules/upgraders/plugins.js
type: application/javascript
module-type: upgrader

Upgrader module that checks that plugins are newer than any already installed version

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var UPGRADE_LIBRARY_TITLE = "$:/UpgradeLibrary";

exports.upgrade = function(wiki,titles,tiddlers) {
	var self = this,
		messages = {},
		upgradeLibrary,
		getLibraryTiddler = function(title) {
			if(!upgradeLibrary) {
				upgradeLibrary = wiki.getTiddlerData(UPGRADE_LIBRARY_TITLE,{});
				upgradeLibrary.tiddlers = upgradeLibrary.tiddlers || {};
			}
			return upgradeLibrary.tiddlers[title]
		};

	// Go through all the incoming tiddlers
	$tw.utils.each(titles,function(title) {
		var incomingTiddler = tiddlers[title];
		// Check if we're dealing with a plugin
		if(incomingTiddler && incomingTiddler["plugin-type"] && incomingTiddler["version"]) {
			// Upgrade the incoming plugin if we've got a newer version in the upgrade library
			var libraryTiddler = getLibraryTiddler(title);
			if(libraryTiddler && libraryTiddler["plugin-type"] && libraryTiddler["version"]) {
				if($tw.utils.checkVersions(libraryTiddler.version,incomingTiddler.version)) {
					tiddlers[title] = libraryTiddler;
					messages[title] = $tw.language.getString("Import/Upgrader/Plugins/Upgraded",{variables: {incoming: incomingTiddler.version, upgraded: libraryTiddler.version}});
					return;
				}
			}
			// Suppress the incoming plugin if it is older than the currently installed one
			var existingTiddler = wiki.getTiddler(title);
			if(existingTiddler && existingTiddler.hasField("plugin-type") && existingTiddler.hasField("version")) {
				// Reject the incoming plugin by blanking all its fields
				if($tw.utils.checkVersions(existingTiddler.fields.version,incomingTiddler.version)) {
					tiddlers[title] = Object.create(null);
					messages[title] = $tw.language.getString("Import/Upgrader/Plugins/Suppressed",{variables: {incoming: incomingTiddler.version, existing: existingTiddler.fields.version}});
					return;
				}
			}
		}
	});
	return messages;
};

})();