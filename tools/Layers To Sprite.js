// Arrange layers into a sprite sheet.
// Photoshop script
if (documents.length > 0)
{
	docRef = activeDocument;
	
	docRef.save();

	var activeLayer = docRef.activeLayer;
	numLayers = docRef.artLayers.length;
	var cols = docRef.width;
	var spriteX = docRef.width;

	// put things in order
	app.preferences.rulerUnits = Units.PIXELS;

	// resize the canvas
	newX = numLayers * spriteX;

	docRef.resizeCanvas(newX, docRef.height, AnchorPosition.TOPLEFT);

	// move the layers around
	for (i=0; i < numLayers; i++)
	{
		docRef.artLayers[i].visible = 1;
		var movX = spriteX*i;
        try
        {
            docRef.artLayers[i].translate(movX, 0);
        }
        catch(err)
        {
            // don't care
        }
	}
	var docExportOptions = new ExportOptionsSaveForWeb(); 

	docExportOptions.format = SaveDocumentType.PNG;
	docExportOptions.dither = Dither.NONE;
	docExportOptions.quality = 100;
	docExportOptions.PNG8 = true;

	docRef.exportDocument(File(docRef.path + '/' + docRef.name.replace('.psd','.png')), ExportType.SAVEFORWEB, docExportOptions);
	// revert
	executeAction( charIDToTypeID( "Rvrt" ), undefined, DialogModes.NO );
}