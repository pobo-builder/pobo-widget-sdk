import Vue from "vue";
import App from "./test.vue";

new Vue({
	render: (createElement) => createElement(App),
}).$mount("#app");
