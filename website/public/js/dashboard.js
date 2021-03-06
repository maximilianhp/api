var dashboardGraphs = ['updateBuildModel'
                        , 'updateWTFModel'
                        , 'updateNoiseModel'
                        , 'updateTweetModel'
                        , 'updateSongsByDayModel'
                        , 'updateStepsModel'
                        , 'updateHydrationModel'
                        , 'updateCaffeineModel'
                        , 'updateBuildDurationModel'
                        , 'updateHourlyBuildHeatMap'
                        , 'updateHourlyStepsHeatMap'
                        , 'updateHourlyTracksHeatMap'
                        , 'updateHourlyWtfHeatMap'
                        , 'updateHourlyHydrationHeatMap'
                        , 'updateHourlyCaffeineHeatMap'
                        , 'updateActiveEvents'
                        , 'updateHourlyGithubPushHeatMap'
                        , 'updateCorrelationData',
                        , 'updateStepsVsTracksCorrelationData',
                        , 'updateIDEActivityVsTracksCorrelationData'];
$(window).resize(function() {
    window.qd.replotGraphs();
});
$(window).load(function() {
    window.qd.plotGraphs(dashboardGraphs);
});
$(document).ready(function() {
    $(document).on('mouseup keyup', function(e) {
        var e = e || event,
            code = (e.keyCode ? e.keyCode : e.which),
            target = e.srcElement || e.target;
        if (code == 27) {
            $('.helpContainer').hide();
        }
    });
});
var show = function(element) {
    var showElement = "#" + element + " " + ".helpContainer";
    $(showElement).slideToggle();
};