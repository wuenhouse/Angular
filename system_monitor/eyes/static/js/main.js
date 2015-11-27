var app = angular.module("myApp", ['darthwade.loading'])

.controller('MainCtrl', function ($scope, $loading) {
    var vm = this;
    vm.show = false;
    vm.report = false;
    vm.domain = "http://pandora-dev.migocorp.com:12345"
    vm.DD = [
        'data_prepare_item',
        'data_prepare_member',
        'data_prepare_recommendation',
        'lrfm',
        'mu_interval',
        'mu2_interval',
        'adjusted_interval',
        'nes_tag_week',
        'nlp_week',
        'nes_lrfm_week',
        'nes_member_week',
        'arpu_week',
        'activeness_week',
        'conversion_week',
        'wakeup_week',
        'valid_week',
        'incremental_interval',
        'member_week',
        'item_week',
        'revenue_week',
        'ta',
        'etta_week',
        'etta_day',
        'ta_done'
    ];
    vm.DDm = [
        'data_prepare_item',
        'data_prepare_member',
        'data_prepare_recommendation',
        'lrfm',
        'mu_interval',
        'mu2_interval',
        'adjusted_interval',
        'nes_tag_week',
        'nes_tag_month',
        'nlp_week',
        'nes_lrfm_week',
        'nes_member_week',
        'nes_member_month',
        'arpu_week',
        'arpu_month',
        'activeness_week',
        'activeness_month',
        'conversion_week',
        'conversion_month',
        'wakeup_week',
        'wakeup_month',
        'valid_week',
        'valid_month',
        'incremental_interval',
        'member_week',
        'member_month',
        'item_week',
        'item_month',
        'revenue_week',
        'revenue_month',
        'ta',
        'etta_week',
        'etta_day',
        'ta_done'
    ];
    vm.startLoading = function (name) {
        $loading.start(name);
    };

    vm.finishLoading = function (name) {
        $loading.finish(name);
    };
    vm.getreport = function(){

        if (vm.date == undefined || vm.date == "") {
            alert('Please specify a day');
            return;
        }
        var dd = [];
        var x = vm.date.substring(4,6);
        var y = vm.date.substring(6,8);
        var k = new Date(vm.date.substring(0,4), x , 0);

        if (k.getDate() == y){
            dd = vm.DDm;
        }else{
            dd = vm.DD;
        }
        var badcount = 0;
        var bad = [];
        var url = vm.domain + "/health/tasks/" + vm.date + "/";
        vm.tasklogs = [];
        total = 0;
        jQuery.ajax({
            type: "GET",
            crossDomain: true,
            url: url,
            async : true,
            complete : function(){
                $loading.finish('users');
                vm.shops = total;
                vm.report = true;
                vm.badcount = badcount;
                vm.percentage = ((total - badcount)/total)*100;
                vm.bads = bad;
            },
            beforeSend : function(){
                $loading.start('users');
            },
            success: function(data){
                total = Object.keys(data).length;
                for (var x in data) {
                    jobs = [];
                    obj = data[x];
                    for (var t in dd){
                        if (obj.hasOwnProperty(dd[t])){
                            jobs.push({
                                'description':dd[t],
                                'success':true,
                                'failed':false
                            });
                        }else{
                            jobs.push({
                                'description':dd[t],
                                'success':false,
                                'failed':true
                            });
                        }
                    };
                    if (Object.keys(data[x]).length != dd.length){
                        badcount += 1;
                        bad.push(x + ",");
                    }
                    vm.tasklogs.push({
                        'shopid':x,
                        'jobs':jobs
                    });
                }
            },
            dataType: "json"
        });
        var ak = 1;
    }
});
