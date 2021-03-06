//main function
var main = function main(graph,layers,mxModel,toolbar,keyHandler,container,model_type,model_specific_main,counter,setupFunctions,undoManager)
{
	// Checks if the browser is supported
	if (!mxClient.isBrowserSupported())
	{
		// Displays an error message if the browser is not supported.
		mxUtils.error(messages["model_main_browser"], 200, false);
	}
	else
	{
		var currentLayer="";
		currentLayer=layers[model_type]; //current layer to be displayed (feature, component, etc)
		graph.setDefaultParent(currentLayer); //any new graphic element will be connected with this parent

		var data=[], c_elements=[], c_attributes=[], c_relations=[], c_properties_styles=[] , c_labels=[];
		data=model_specific_main(graph); //specific model data
		c_elements=data[0];
		c_attributes=data[1];
		c_relations=data[2];
		c_properties_styles=data[3];
		c_labels=data[4];

		//counter equals 1 load the entire mxGraph 
		if(counter==1){
			// Disables the built-in context menu
			mxEvent.disableContextMenu(container);
			
			// Matches DnD inside the graph
			mxDragSource.prototype.getDropTarget = function(graph, x, y){
				var cell = graph.getCellAt(x, y);
				
				if (!graph.isValidDropTarget(cell)){
					cell = null;
				}
				
				return cell;
			};

			//setup graph config
			setup_graph_config(graph);
			//setup keys
			setupFunctions["setup_keys"](keyHandler,graph);
			//setup properties
			setupFunctions["setup_properties"](graph,c_properties_styles);
			//setup label changed
			setup_label_changed(graph,c_labels);
			//setup custom elements
			setupFunctions["setup_elements"](graph,c_elements,c_attributes,toolbar);
			//setup relations
			setupFunctions["setup_relations"](graph,c_relations);
			//setup buttons
			setupFunctions["setup_buttons"](graph,undoManager);
			//setup custom shapes
			setup_custom_shapes();
		}else{
			//counter equals 2 only setup the labels, elements, properties and relations
			//setup label changed
			setup_label_changed(graph,c_labels);
			//setup properties
			setupFunctions["setup_properties"](graph,c_properties_styles);
			//setup custom elements
			setupFunctions["setup_elements"](graph,c_elements,c_attributes,toolbar);	
			//setup relations
			setupFunctions["setup_relations"](graph,c_relations);	
		}

		//hide all elements that do not belong to the current layer (parent)
		for (var key in layers) {
			mxModel.setVisible(layers[key], false);
		}
		mxModel.setVisible(currentLayer, true);
	}

	function setup_custom_shapes(){
		function CustomShape()
		{
			mxShape.call(this);
		};
		mxUtils.extend(CustomShape, mxShape);

		// Replaces existing actor shape
		mxCellRenderer.registerShape('customShape', CustomShape);
		
		// Loads the stencils into the registry
		var req = mxUtils.load('/static/xml/MX/custom_shapes.xml');
		var root = req.getDocumentElement();
		var shape = root.firstChild;
		
		while (shape != null)
		{
			if (shape.nodeType == mxConstants.NODETYPE_ELEMENT)
			{
				mxStencilRegistry.addStencil(shape.getAttribute('name'), new mxStencil(shape));
			}
			shape = shape.nextSibling;
		}
	}

	function setup_graph_config(graph){
		graph.dropEnabled = true;
		graph.setConnectable(true); // Enables new connections in the graph
		graph.setMultigraph(false);
		graph.setAllowDanglingEdges(false);
		graph.setCellsDisconnectable(false) // Avoid disconect egdes
		graph.setDisconnectOnMove(false);
		graph.setPanning(true);
		graph.setCellsEditable(false); // Avoid double click cells
		new mxRubberband(graph); // Enables rectangular selection
		graph.maximumGraphBounds = new mxRectangle(0, 0, 2000, 2000);
		new mxOutline(graph, document.getElementById('navigator'));
	}

	function setup_label_changed(graph,c_labels){		
		graph.convertValueToString = function(cell)
		{
		  if (mxUtils.isNode(cell.value))
		  {
			if(c_labels != null && c_labels[cell.getAttribute("type")]){
				return cell.getAttribute(c_labels[cell.getAttribute("type")], '')
			}else{
				if(cell.isEdge()){
					return cell.getAttribute('relType', '')
				}else{
					return cell.getAttribute('label', '') 
				}
			}
		  }
		};
	}
}

export default main