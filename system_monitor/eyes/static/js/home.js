function MainCtrl() {
    var vm = this;
    vm.show = false;
    
    vm.login = function(){
        if (vm.show == false) {
            vm.show = true;
        }else{
            vm.show = false;
        }
    };

    vm.en = function() {
        vm.open = false;

        if(vm.answer1 != "Tony Chen" || vm.answer2 != "Rungchi Chen"){
            vm.open = true
            return;
        }
        else{
            window.location = 'http://10.1.4.45:12345/health/main'
        }
    };
}
