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
        css: "",
        colors: {
            header: "#cb3577",
            headerFont: "#fff",
            font: "#fff",
            background: "#ffdddc",
            amount: ['#ffacf6', '#d052d0', '#ff5fb8', '#ff00a5', '#6b486b', '#6b215c', '#3c1231','#ff55d2'],
            //       head    ,  odd tr  ,  even tr , font
            table: ['#ff5fb8', '#ab3978', '#AB4C79', '#fff'],
            //     background, inset   , color
            input: ['#ff5fb8','#ab3978','#fff'],
            line: "#000",
            axis: "#000"
        }
    },{
        collection: 'themes',
        name: 'dark',
        wallpaper: '',
        css: "#header { box-shadow: 1px 0 90px 59px #000000; }",
        colors: {
            header: "#002f2c",
            headerFont: "#fff",
            font: "#fff",
            background: "#151515",
            amount: ['#00625B', '#347B76', '#00bfb2', '#99abd4', '#564389', '#22076E', '#8dffce', '#3b77ff'],
            table: ['#ff5fb8', '#ab3978', '#AB4C79', '#fff'],
            input: ['#ff5fb8','#ab3978','#fff'],
            line: "#fff",
            axis: "#fff"
        }
    },{
        collection: 'themes',
        name: 'pirates',
        wallpaper: '',
        css: "body { color: black; }",
        colors: {
            header: "#002f2c",
            headerFont: "#fff",
            font: "#fff",
            background: "#151515",
            amount: ['#00625B', '#347B76', '#00bfb2', '#99abd4', '#564389', '#22076E', '#8dffce', '#3b77ff'],
            table: ['#ff5fb8', '#ab3978', '#AB4C79', '#fff'],
            input: ['#ff5fb8','#ab3978','#fff'],
            line: "#fff",
            axis: "#fff"
        }
    },{
        collection: 'themes',
        name: 'vampire',
        wallpaper: '',
        css: "body { color: black; }",
        colors: {
            header: "#002f2c",
            headerFont: "#fff",
            font: "#fff",
            background: "#151515",
            amount: ['#00625B', '#347B76', '#00bfb2', '#99abd4', '#564389', '#22076E', '#8dffce', '#3b77ff'],
            table: ['#ff5fb8', '#ab3978', '#AB4C79', '#fff'],
            input: ['#ff5fb8','#ab3978','#fff'],
            line: "#fff",
            axis: "#fff"
        }
    },{
        collection: 'themes',
        name: 'green',
        wallpaper: '',
        css: "body { color: black; }",
        colors: {
            header: "#002f2c",
            headerFont: "#fff",
            font: "#fff",
            background: "#151515",
            amount: ['#00625B', '#347B76', '#00bfb2', '#99abd4', '#564389', '#22076E', '#8dffce', '#3b77ff'],
            table: ['#ff5fb8', '#ab3978', '#AB4C79', '#fff'],
            input: ['#ff5fb8','#ab3978','#fff'],
            line: "#fff",
            axis: "#fff"
        }
    }
];

themes.forEach(function(theme) {
    eb.send('save', theme);
});