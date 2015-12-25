var app = angular.module("myApp", ['darthwade.loading', 'ngDialog'])
.controller('MainCtrl', function ($scope, $loading, $http, $templateCache, ngDialog) {

    Date.prototype.addDays = function(days)
    {
        var dat = new Date(this.valueOf());
        dat.setDate(dat.getDate() + days);
        return dat;
    }
    var vm = this;
    vm.seven = false;
    vm.show = false;
    vm.report = false;
    vm.domain = "http://pandora-dev.migocorp.com:12345"
    vm.pops = function (shopid, caldate){
        new_url = vm.domain + "/health/pop/" + shopid + "/" + caldate + "/";
        window.open(new_url, shopid + 'for ' + caldate + ' query', config='height=1024,width=800');
    };
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
    vm.predicate = 'shopid';
    vm.reverse = true;
    vm.order = function(predicate) {
        vm.reverse = (vm.predicate === predicate) ? ! vm.reverse : false;
        vm.predicate = predicate;
    };
    vm.task7 = [];
    vm.badcount = 0;
    vm.successSOP = function (data, caldate) {
        total = Object.keys(data).length;
        for (var x in data) {
            jobs = [];
            obj = data[x];
            if (Object.keys(data[x]).length != vm.dd.length){
                vm.badcount += 1;
                vm.task7.push({
                    'shopid':x,
                    'caldate': caldate,
                    'success':false,
                    'failed':true
                });
                continue;
            }
        }

    };
    vm.PROC = function(url, d){
        $http({method: 'GET', url:url}).
            then(function(response) {
                vm.status = response.status;
                vm.data = response.data;
                vm.successSOP(vm.data, d);
                if (vm.endcount == 6){
                    $loading.finish('users');}
                else{
                    vm.endcount += 1;}
            }, function(response) {
                vm.data = response.data || "Request failed";
                vm.status = response.status;
            });
    }
    vm.getreport = function(shopid){
        if (vm.date == undefined || vm.date == "") {
            alert('Please specify a day');
            return;
        }
        var dd = [];
        var x = vm.date.substring(4,6);
        var y = vm.date.substring(6,8);
        var k = new Date(vm.date.substring(0,4), x , 0);
        vm.report = false;
        if (k.getDate() == y){
            vm.dd = vm.DDm;
        }else{
            vm.dd = vm.DD;
        }
        var badcount = 0;
        var bad = [];
        var url = vm.domain + "/health/tasks/" + vm.date + "/";
        vm.tasklogs = [];
        vm.task7 = [];
        total = 0;
        if(vm.seven){
            vm.endcount = 0;
            $loading.start('users');
            for (var i=0 ; i <= 6 ; i++){
                var d = new Date(vm.date.substring(0,4) + '/' + vm.date.substring(4,6) + '/' + vm.date.substring(6,8));
                d = d.addDays(-1*i).toISOString().slice(0,10).replace(/-/g,"");
                url = vm.domain + "/health/tasks/" + d + "/";
                vm.PROC(url, d);
            }
        }
        else{
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
                        for (var t in vm.dd){
                            if (obj.hasOwnProperty(vm.dd[t])){
                                jobs.push({
                                    'description':vm.dd[t],
                                    'success':true,
                                    'failed':false
                                });
                            }else{
                                jobs.push({
                                    'description':vm.dd[t],
                                    'success':false,
                                    'failed':true
                                });
                            }
                        };
                        if (Object.keys(data[x]).length != vm.dd.length){
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
        };
        var ak = 1;
    }
    var rightNow = new Date();
    var numberOfDaysToAdd = -1;
    rightNow.setDate(rightNow.getDate() + numberOfDaysToAdd); 
    var res = rightNow.toISOString().slice(0,10).replace(/-/g,"");
    vm.date = res;
    //vm.getreport();
    //vm.updateModel('JSONP', 'http://10.10.22.16:8000/lemon/qa/zhoushanxm/20151121/');
});
