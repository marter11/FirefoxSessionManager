 

function getInfoFromOpenWindows()
{
    var windowsGetAllPromise = browser.windows.getAll({
        populate: true
    })
    .then(function* (e) {
        for(const window of e)
        {
            yield window.tabs.map((tab) => {
                return {
                "title": tab.title, 
                "url": tab.url, 
                "favicon": tab.favIconUrl}
            });
        }
    });

    return windowsGetAllPromise
}

function saveInfoFromOpenWindows(session_name, tabsArray)
{

    browser.storage.local.clear();

    // browser.storage.local.onChanged.addListener((e) => console.log("CHANGE"));

    // An array represents a window, it stores a window worth of tabs
    session_object = {};
    session_object[session_name] = tabsArray

    var saveInfoFromOpenWindowsPromise = browser.storage.local.set(session_object)
    .then((e) => {
        console.log("Saved");
    })
    .catch((err) => console.log(err));

    return saveInfoFromOpenWindowsPromise;
}

function LoadInfoFromLocalStorage()
{
    let a = browser.storage.local.get()
    .then(session => {
        console.log("RAN", session);
        return session;
    })
    .catch(err => console.log(err));

}

const saveSession = (name) => {
    let windowsGetAllPromise = getInfoFromOpenWindows();
    const resolvePromise = async () => {
        let promiseValue = await windowsGetAllPromise;
        
        // merge the different windows into one session
        let sessionArray = [];
        for(const value of promiseValue)
        {
            sessionArray.push(value);
        }
        
        saveInfoFromOpenWindows(name, sessionArray);
        LoadInfoFromLocalStorage();
    }

    resolvePromise();
}


document.addEventListener("submit", (e) => {
    e.preventDefault();
});

document.addEventListener("click", (e) => {
    let id = e.target.id;
    if(id == "save_session")
    {
        let session_name = document.getElementById("session_name").value;
        if(!session_name)
        {
            console.log("ERROR");
        } else {
            saveSession(session_name);
        }
    }
});



