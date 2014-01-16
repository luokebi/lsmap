// Start with the map page
window.location.replace(window.location.href.split("#")[0] + "#mappage");

var selectedFeature = null;

// fix height of content
function fixContentHeight() {
    var footer = $("div[data-role='footer']:visible"),
        content = $("div[data-role='content']:visible:visible"),
        viewHeight = $(window).height(),
        contentHeight = viewHeight - footer.outerHeight();

    if ((content.outerHeight() + footer.outerHeight()) !== viewHeight) {
        contentHeight -= (content.outerHeight() - content.height() + 1);
        content.height(contentHeight);
    }

    if (window.qdMap && window.qdMap instanceof OpenLayers.Map) {
        qdMap.updateSize();

    } else {
        // initialize map
       /*init(function(feature) { 
            selectedFeature = feature; 
            $.mobile.changePage("#popup", "pop"); 
        });*/
        
    }
}


// one-time initialisation of button handlers 

$("#plus").on('click', function(){
    qdMap.zoomIn();
});

$("#minus").on('click', function(){
    qdMap.zoomOut();
});


$("#locate").on('click',function(){
    var control = map.getControlsBy("id", "locate-control")[0];
    if (control.active) {
        control.getCurrentLocation();
    } else {
        control.activate();
    }
});

//fix the content height AFTER jQuery Mobile has rendered the map page
$('#mappage').on('pageshow',function (){
    fixContentHeight();
});
    
$(window).bind("orientationchange resize pageshow", fixContentHeight);



$('#popup').on('pageshow',function(event, ui){
    var li = "";
    for(var attr in selectedFeature.attributes){
        li += "<li><div style='width:25%;float:left'>" + attr + "</div><div style='width:75%;float:right'>" 
        + selectedFeature.attributes[attr] + "</div></li>";
    }
    $("ul#details-list").empty().append(li).listview("refresh");
});

$('#searchpage').on('pageshow',function(event, ui){
    $('#query').bind('change', function(e){
        $('#search_results').empty();
        if ($('#query')[0].value === '') {
            return;
        }
        $.mobile.loading("show");

        // Prevent form send
        e.preventDefault();

        var searchUrl = '/Home/Search';
       // searchUrl += '&name_startsWith=' + $('#query')[0].value;
		$.post(searchUrl, {type:1,value:$('#query')[0].value}, function(data, textStatus) {
					 $.each(data.data, function() {
						var place = this;
						$('<li>')
							.hide()
							.append($('<h2 />', {
								text: place.name
							}))
							.append($('<p />', {
								html: '<b>' + place.campus + '</b> ' 
							}))
							.appendTo('#search_results')
							.click(function() {
								$.mobile.changePage('#mappage');
								qdMap.setBaseLayer(qdMap.getLayersByName(place.campus)[0]);
								
								var lonlat = new OpenLayers.LonLat(place.x, place.y);
								qdMap.setCenter(lonlat, 3);
							})
							.show();
					});
					$('#search_results').listview('refresh');
					$.mobile.loading("hide");					   
									   
		}, "json");
       /* $.getJSON(searchUrl, function(data) {
            $.each(data.data, function() {
                var place = this;
                $('<li>')
                    .hide()
                    .append($('<h2 />', {
                        text: place.name
                    }))
                    .append($('<p />', {
                        html: '<b>' + place.campus + '</b> ' 
                    }))
                    .appendTo('#search_results')
                    .click(function() {
                        $.mobile.changePage('#mappage');
                        var lonlat = new OpenLayers.LonLat(place.x, place.y);
                        map.setCenter(lonlat, 3);
                    })
                    .show();
            });
            $('#search_results').listview('refresh');
            $.mobile.hidePageLoadingMsg();
        });*/
    });
    // only listen to the first event triggered
    $('#searchpage').off('pageshow', arguments.callee);
});


function initLayerList() {
    //$('#layerspage').page();
    $('<li>', {
            "data-role": "list-divider",
            text: "Base Layers"
        })
        .appendTo('#layerslist');
    var baseLayers = qdMap.getLayersBy("isBaseLayer", true);
    $.each(baseLayers, function() {
        addLayerToList(this);
    });

    $('<li>', {
            "data-role": "list-divider",
            text: "Overlay Layers"
        })
        .appendTo('#layerslist');
    var overlayLayers = qdMap.getLayersBy("isBaseLayer", false);
    $.each(overlayLayers, function() {
        addLayerToList(this);
    });
    //$('#layerslist').listview('refresh');
    
    qdMap.events.register("addlayer", this, function(e) {
        addLayerToList(e.layer);
    });
}

function addLayerToList(layer) {
	//console.log(layer);
	
    var item = $('<li>', {
            "data-icon": "check",
            "class": layer.visibility ? "checked" : ""
        })
        .append($('<a />', {
            text: layer.name
        })
            .click(function() {
                //$.mobile.changePage('#mappage');
                $('#defaultpanel').panel('close');
                if (layer.isBaseLayer) {
                    layer.map.setBaseLayer(layer);
                } else {
                    layer.setVisibility(!layer.getVisibility());
                }
            })
        )
        .appendTo('#layerslist');
    layer.events.on({
        'visibilitychanged': function() {
            $(item).toggleClass('checked');
        }
    });
}
