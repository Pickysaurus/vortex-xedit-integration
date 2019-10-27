# vortex-xedit-integration
Integrates an automated plugin cleaning function into Vortex for Gamebyro plugins. 

**This extension requires [xEdit by ElminsterAU](https://github.com/TES5Edit/TES5Edit/releases) to be installed on your PC and defined in the dashboard of your chosen game inside Vortex.**

In v0.0.1 a new button has been added to the info pane for Gamebyro plugins which will lauch xEdit and perform a "quick auto clean" operation on the selected plugin. 

A future update may allow the user to right-click a plugin to activate the cleaning function from the context menu, however this is currently not possible.

The cleaning option will not appear if the plugin is the primary master file (e.g. Skyrim.esm). 

The cleaning option will be disabled if either the plugin has missing masters or there is a LOOT message informing the user not to clean it. In the later case, you are free to clean it manually, this just disables the automation. 

Once xEdit has closed, Vortex will show a confirmation of the plugin we attempted to clean. 

![An image showing the cleaning confirmation message.](https://i.imgur.com/Yy5RPr2.png)

Currently supports:
- Skyrim
- Skyrim SE
- Skyrim VR
- Fallout 4
- Fallout 4 VR
- Fallout New Vegas
- Oblivion
- Fallout 3
- Enderal
- Fallout 76

![An image showing the new button](https://i.imgur.com/A2zojZH.png)

xEdit logo icon was provided by Felis Noctis.
