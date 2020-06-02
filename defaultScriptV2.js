
GoBrain.require('Qbrick.Interact.Widget.Element');
Qbrick.Interact.Widget.Element.click = Qbrick.Interact.Widget.Element.click || function () {};


function pause(widgetId){
    if (GoBrain && GoBrain.widgets(widgetId)) {
        GoBrain.widgets(widgetId).pause();

        return;
    }

    window.parent.postMessage({
        origin: 'GoBrain.Customers.Sample.Modules.Sequences.CustomHtmlOverlay::ChildFrame',
        command: {
            type: 'WidgetCommand',
            action: 'pause',
            arguments: []
        }
    }, '*');
}

function play(widgetId){
    if (GoBrain && GoBrain.widgets(widgetId)) {
        GoBrain.widgets(widgetId).play();

        return;
    }
    
    window.parent.postMessage({
        origin: 'GoBrain.Customers.Sample.Modules.Sequences.CustomHtmlOverlay::ChildFrame',
        command: {
            type: 'WidgetCommand',
            action: 'play',
            arguments: []
        }
    }, '*');
}

//function onClickAreaV2(show, hide, svgId, actions)
function onClickArea(show, hide, openurl, playerCmd, svgId, position, setdata, replaceCurrentMedia, customData, opentarget, tries){
    if(arguments.length === 4 && (typeof playerCmd === 'object' && playerCmd !== null)){
        svgId = openurl;
        tries = undefined;
        var actions = playerCmd;
        openurl = ("openUrl" in actions) ? actions.openUrl.value : false;
        opentarget = ("openUrl" in actions && "target" in actions.openUrl) ? actions.openUrl.target : "_blank";
        playerCmd = ("playPause" in actions) ? actions.playPause.value : false;
        position = ("jumpToTime" in actions) ? actions.jumpToTime.value : undefined;
		fadeOut = ("fadeOut" in actions) ? actions.fadeOut.value : false;
        setdata = ("loadVideo" in actions) ? actions.loadVideo.value : false;
        setdata = ("videoToPlaylist" in actions) ? actions.videoToPlaylist.value : setdata;
        replaceCurrentMedia = !("videoToPlaylist" in actions);
        customData = ("customEvent" in actions) ? actions.customEvent.value : false;
    }

    replaceCurrentMedia = (replaceCurrentMedia === undefined) ? true : replaceCurrentMedia;
    customData = (customData === undefined) ? "" : customData;
    opentarget = (opentarget === undefined) ? "_top" : opentarget;
    tries = (tries === undefined) ? 10 : tries;

    console.log(show, hide, openurl, playerCmd, svgId, position, setdata, replaceCurrentMedia, customData, opentarget, tries,fadeOut);

    var svg = svgId ? document.querySelector('#' + svgId) : document;

    if(!svg || !svg.getAttribute('data-gobrain-widgetId')){
        if(tries>0){
            setTimeout(function(){
                onClickArea(show, hide, openurl, playerCmd, svgId, position, setdata, replaceCurrentMedia, customData, opentarget, --tries);
            }, 100);
        };
        return;
    }

    show.split(', ').forEach(function(id){
        var elem = id && svg.querySelector('#' + id);
        if(elem && elem.classList.contains('hide')){
            var newElem = elem.cloneNode(true);
            newElem.classList.replace('hide', 'show');
            elem.parentNode.replaceChild(newElem, elem);
        }
    });
    hide.split(', ').forEach(function(id){
        var elem = id && svg.querySelector('#' + id);
        if(elem && elem.classList.contains('show')){
            var newElem = elem.cloneNode(true);
            newElem.classList.replace('show', 'hide');
            elem.parentNode.replaceChild(newElem, elem);
        }
    });

    if(openurl){
        window.open(openurl, opentarget);
    }
	
	if(fadeOut){
        var el = svg
    
		// .5s - time of the animation duration
		el.style.WebkitTransition = 'opacity .5s';
		el.style.opacity = '0';
    }else {
		var el = svg
    
		// .5s - time of the animation duration
		el.style.WebkitTransition = 'opacity 0s';
		el.style.opacity = '1';
	}

    if(setdata !== undefined && setdata){
        if (GoBrain && GoBrain.widgets(svg.getAttribute('data-gobrain-widgetId'))) {
            GoBrain.widgets(svg.getAttribute('data-gobrain-widgetId')).data(setdata, {}, replaceCurrentMedia);
        }
    }

    if(position !== undefined){
        if (GoBrain && GoBrain.widgets(svg.getAttribute('data-gobrain-widgetId'))) {
            GoBrain.widgets(svg.getAttribute('data-gobrain-widgetId')).position(position);
            return;
        }
    }

    try{
        eval(playerCmd+'("' + (svg!==document ? svg.getAttribute('data-gobrain-widgetId'): "") + '")');
    } catch(e){
        console.log('No such cmd', playerCmd);
    }


    //To listen ibn parent frame:
    // window.addEventListener("message", (message) => {
        
    //}, false)

    Qbrick.Interact.Widget.Element.click({
        playerId: svg.getAttribute('data-gobrain-widgetId'),
        elementId: svgId,
        customData: customData
    });

    window.parent.postMessage({
        origin: 'Qbrick.Interact.Widget.Element',
        command: {
            type: 'PageCommand',
            action: 'click',
            data: {
                playerId: svg.getAttribute('data-gobrain-widgetId'),
                elementId: svgId,
                customData: customData
            }
        }
    }, '*');
}

try{
    if(typeof(widgetLoaded) !== 'undefined'){
        widgetLoaded();
    }
} catch (err){

}