<template>
  <div>

    <div class="card mb-3">
            <div class="card-header">
              <i class="fas fa-chart-area"></i>
              {{ $t("models_area") }} - {{ $route.params.type }} {{ $t("models_model") }}</div>
            <div class="card-body">

              <div class="button-area">
                    <div class="button-unique" id="buttonXML"></div><div class="button-unique" id="buttonRESET"></div>
                    <div class="button-unique" id="buttonSAVE"></div><div class="button-unique" id="buttonUNDO"></div>
                    <div class="button-unique" id="buttonREDO"></div><div class="button-unique" id="buttonSHOW"></div>
                    <div class="button-unique" id="buttonEXPORT"></div>
                    <div class="button-unique" id="buttonIMPORT" type="file"></div>
              </div>

              <div class="row main_area">

                <div class="col-sm-9 left-area">
                  <div id="graphContainer" class="model-area"></div>
                  <div class="properties-area"><b>{{ $t("models_element_properties") }}</b><br />
                    <div id="properties"></div>
                  </div>
                </div>

                <div class="col-sm-3 right-area">
                  <div class="pallete-area">
                  <b>{{ $t("models_palette") }}</b><br /><br />
                  <div id="tbContainer"></div>
                  </div>
                  <div class="other-area"><b>{{ $t("models_navigator") }}</b>
                  <div id="navigator" class="navigator"></div>
                  </div>
                </div>

              </div>
              </div>

            <div class="card-footer small text-muted"></div>
        </div>

        <div>
          <input type="hidden" id="model_code" @change="persist()" v-model="modelCode" />
          <input type="hidden" id="current_type" v-bind:value="$route.params.type" />
          <input id="file" type="file" class="button_hidden" />
        </div>
  </div>

</template>

<script>
import setup_relations from '@/assets/js/models/setup_relations.js'
import setup_elements from '@/assets/js/models/setup_elements.js'
import setup_buttons from '@/assets/js/models/setup_buttons.js'
import setup_keys from '@/assets/js/models/setup_keys.js'
import setup_properties from '@/assets/js/models/setup_properties.js'
import main from '@/assets/js/models/model_main.js'
import model_load from '@/assets/js/models/model_load.js'
import feature_main from '@/assets/js/models/custom/feature.js'
import component_main from '@/assets/js/models/custom/component.js'

export default{
  data: function(){
    return {
      modelCode: "",
      graph:"",
      toolbar:"",
      keyHandler:"",
      undoManager:"",
      layers:{},
      modelFunctions:{},
      setupFunctions:{},
      models:[],
      currentFunction:"",
      mxModel:"",
      modelType:""
    }
  },
  mounted: function(){
    this.models = ["feature","component"]; //represent the available models
    this.modelFunctions = {
      "feature":feature_main,
      "component":component_main
    }
    this.setupFunctions = {
      "setup_relations":setup_relations,
      "setup_buttons":setup_buttons,
      "setup_keys":setup_keys,
      "setup_properties":setup_properties,
      "setup_elements":setup_elements
    }
    //preload the saved model if exists
    if (localStorage["model_code"]) {
        this.modelCode = localStorage["model_code"];
    }
    this.graph = new mxGraph(document.getElementById('graphContainer'));
    //load saved model into the graph if exists, and return layers
    this.layers=model_load(this.graph,this.models,this.modelCode);
    this.modelType=this.$route.params.type; //based on URL Route
    this.currentFunction=this.modelFunctions[this.modelType];
    this.toolbar = new mxToolbar(document.getElementById('tbContainer'));
    this.keyHandler = new mxKeyHandler(this.graph);
    this.undoManager = new mxUndoManager();
    this.mxModel = this.graph.getModel();

    this.initialize_mx(1);
    //clear undo redo history
    this.undoManager.clear();
  },
  methods: {
    persist() {
      //save model in localstorage
      localStorage["model_code"] = document.getElementById('model_code').value;
    },
    initialize_mx(counter){
      //counter equals 1 load the entire mxGraph 
      //counter equals 2 only setup the labels, elements, properties and relations
      var graphContainer = document.getElementById('graphContainer');
      main(this.graph,this.layers,this.mxModel,this.toolbar,this.keyHandler,graphContainer,this.modelType,this.currentFunction,counter,this.setupFunctions,this.undoManager);
    }
  },
  beforeRouteLeave(to, from, next){
    //destroy the window key events before leaving
    this.keyHandler.destroy();
    next();
  },
  watch:{
    $route (to, from){
      //remove the palette content when there is a change in the component route
      document.getElementById('tbContainer').innerHTML="";
      this.modelType=this.$route.params.type;
      this.currentFunction=this.modelFunctions[this.modelType];
      this.initialize_mx(2);
      //clear undo redo history
      this.undoManager.clear();
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@media (max-width: 992px){
  .right-area, .left-area{
    flex: 100%;
    max-width: 100%;
  }
  .right-area{
    border-left: 0px !important;
  }
}

.button-unique{
  display: -webkit-box;
  float: left;
}

.button_hidden{
  visibility:hidden;
}

.main_area{
  margin-right: 0px;
  margin-left: 0px;
  margin-top: -6px;
}

.left-area{
  padding-right: 0px;
  padding-left: 0px;
}

.right-area{
  padding-right: 0px;
  padding-left: 0px;
  border-top: 1px solid rgba(0,0,0,.125);
  border-left: 1px solid rgba(0,0,0,.125);
}

.navigator{
  border: 2px solid rgba(0,0,0,.125);
  margin-top: 10px;
}

.button-area{
  display: inline-block;
  border-bottom: 2px solid rgba(0,0,0,.125);
  border-top: 1px solid rgba(0,0,0,.125);
  width: 100%;
}

.card-header {
  text-align: left;
}

.card-body {
  padding: 0px;
  background-color: white;
}

.properties-area, .other-area{
  border-top: 1px solid rgba(0,0,0,.125);
	padding: 15px;
}

.model-area{
  overflow-block: scroll;
  overflow-x: auto;
  overflow-y: auto;
  height:350px;
  background:url("/static/images/MX/editors/grid.gif");
  cursor:default;
  padding-right: 0px; 
  padding-left: 0px;
}

.pallete-area{
  padding: 15px;
}

.pad20{
	padding-top:20px;
}

table{
	font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
  font-size: 14px;
}

.properties-table td{
	padding: 5px;
}
</style>
