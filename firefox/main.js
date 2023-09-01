 

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

    // browser.storage.local.clear();

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


function displayWinowInstancesOnRight(event)
{
    const location = document.getElementById("open_session_container");
    location.innerHTML = event.target.innerHTML;

    // console.log(event.target.children);
    // console.log(event.target.innerHTML);
}

// An instance of this represents the session itself
class sessionSectionConstructor
{
    constructor(session_name)
    {
        this.newSessionContainer = document.createElement("div");
        this.newSessionContainer.setAttribute("class", "sessionContainer");
        this.newSessionContainer.innerText = session_name;
        this.newSessionContainer.onclick = displayWinowInstancesOnRight;
    }

    // Automatically add it to the current session, which is the created object
    addNewWindow(window)
    {

        let newwindowContainer = document.createElement("div");
        newwindowContainer.setAttribute("class", "windowContainer");

        // Reveal when session container is clicked
        // newwindowContainer.setAttribute("hidden", true);

        this.newSessionContainer.appendChild(newwindowContainer);

        return newwindowContainer;

    }

    addNewTab(to_window, tab)
    {
        let newtabContainer = document.createElement("div");
        newtabContainer.setAttribute("class", "tabContainer");

        // Add title paragraph
        let tabTitle = document.createElement("p");
        tabTitle.innerText = tab.title;

        // Add favico

        newtabContainer.appendChild(tabTitle);
        to_window.appendChild(newtabContainer);
    }

    commit(section_to)
    {
        const location = document.getElementById("session_side");
        location.appendChild(this.newSessionContainer);
    }


}

function insertSessionsIntoHTML(session_name, session_object)
{
    const location = document.getElementById("session_side");
    const sessionConsturctorObject = new sessionSectionConstructor(session_name);

    for(const window of session_object)
    {
        const newWindow = sessionConsturctorObject.addNewWindow(window);

        for(const tab of window)
        {
            sessionConsturctorObject.addNewTab(newWindow, tab);
        }
    }

    sessionConsturctorObject.commit();

}

function DisplayFromLocalStorage()
{
    browser.storage.local.get().then(all_session_object => {
        
        // Insert the whole local storage into the session display section
        const session_keys = Object.keys(all_session_object);

        for(const session_key of session_keys)
        {
            let session_object = all_session_object[session_key];
            insertSessionsIntoHTML(session_key, session_object);
        }
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
        
        // Save current session and load it to the UI
        saveInfoFromOpenWindows(name, sessionArray);
        DisplayFromLocalStorage();
    }

    resolvePromise();
}


// Handler section

window.addEventListener('load', (e) => {
    DisplayFromLocalStorage();
});

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



