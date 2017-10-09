var eb = vertx.eventBus();


// first config init
var config = {
    collection: 'config',
    theme: 'blossom'
};
eb.send('save', config);



// initial themes
var themes = [
    {
        collection: 'themes',
        name: 'blossom',
        wallpaper: '',
        colors: {
            header: "#cb3577",
            headerFont: "#fff",
            background: "#ffdddc",
            amount: ['#ffacf6', '#d052d0', '#ff5fb8', '#ff00a5', '#6b486b', '#6b215c', '#3c1231','#ff55d2'],
            line: "#000",
            axis: "#000"
        }
    },{
        collection: 'themes',
        name: 'dark',
        wallpaper: '',
        colors: {
            header: "#002f2c",
            headerFont: "#fff",
            background: "#151515",
            amount: ['#00625B', '#347B76', '#00bfb2', '#99abd4', '#564389', '#22076E', '#8dffce', '#3b77ff'],
            line: "#fff",
            axis: "#fff"
        }
    },{
        collection: 'themes',
        name: 'pirates',
        wallpaper: '',
        colors: {
            header: "#002f2c",
            headerFont: "#fff",
            background: "#151515",
            amount: ['#00625B', '#347B76', '#00bfb2', '#99abd4', '#564389', '#22076E', '#8dffce', '#3b77ff'],
            line: "#fff",
            axis: "#fff"
        }
    },{
        collection: 'themes',
        name: 'vampire',
        wallpaper: '',
        colors: {
            header: "#002f2c",
            headerFont: "#fff",
            background: "#151515",
            amount: ['#00625B', '#347B76', '#00bfb2', '#99abd4', '#564389', '#22076E', '#8dffce', '#3b77ff'],
            line: "#fff",
            axis: "#fff"
        }
    },{
        collection: 'themes',
        name: 'green',
        wallpaper: '',
        colors: {
            header: "#002f2c",
            headerFont: "#fff",
            background: "#151515",
            amount: ['#00625B', '#347B76', '#00bfb2', '#99abd4', '#564389', '#22076E', '#8dffce', '#3b77ff'],
            line: "#fff",
            axis: "#fff"
        }
    }
];

themes.forEach(function(theme) {
    eb.send('save', theme);
});