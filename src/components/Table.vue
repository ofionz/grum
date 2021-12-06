<template>
  <div>

    <ejs-schedule
        v-if="isInit"
        id='Schedule' height='600px' :locale='"ru"' :firstDayOfWeek='1'
        :popupOpen='onPopupOpen' :cellClick="onCellClick" :eventClick="onEventClick"
        :showTimeIndicator="false"
        ref="schedule"
        :startHour="startHour" :endHour="endHour" :eventSettings='eventSettings'
        :timeScale='timeScale'>
      <e-views>
        <e-view option='Week' dateFormat='dd-MMM-yyyy'></e-view>
      </e-views>
    </ejs-schedule>


    <v-dialog
        v-model="modalState.show"
        max-width="600px"
    >
      <v-card v-if="modalState.show">
        <v-card-title class="d-flex flex-column">
          <span class="text-h5 ">{{ modalState.title }}</span>
          <v-subheader v-if="modalState.date" class="d-flex flex-column">
            <span>{{ modalState.MASTER.NAME + " " + modalState.MASTER.LAST_NAME }} </span><span>{{
              modalState.date.getFullYear() + '/' + (1 + modalState.date.getMonth()) + "/" + modalState.date.getDate()
            }}</span>
          </v-subheader>

        </v-card-title>
        <v-card-text>
          <v-container>

            <v-select label="Помощник"
                      hint="В списке только доступные на текущую дату"
                      :items="modalState.ASSISTANTS"
                      v-model="curElem.ASSISTANT_ID"
                      item-value="ID"
                      :disabled="!isEditable"
            >
              <template v-slot:selection="{ item }">
                <span> {{ item.NAME + " " + item.LAST_NAME }}</span>
              </template>
              <template v-slot:item="{ item }">
                <span> {{ item.NAME + " " + item.LAST_NAME }}</span>
              </template>
            </v-select>

            <v-select label="Салон"
                      hint="В списке только доступные на текущую дату"
                      :items="modalState.SALONS"
                      v-model="curElem.SALON_ID"
                      :disabled="!isEditable"
                      item-text="NAME"
                      item-value="ID"
            >
            </v-select>
          </v-container>

        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              :disabled="!isEditable"
              color="red darken-1"
              text
              v-if="curElem.ID "
              @click="deleteElem"
          >
            {{ "Удалить" }}
          </v-btn>
          <v-btn
              :disabled="!curElem.SALON_ID || !isEditable"
              color="green darken-1"
              text

              @click="curElem.ID?updateElem():saveElem()"
          >
            {{ curElem.ID ? "Изменить" : "Добавить" }}
          </v-btn>
          <v-btn
              color="blue darken-1"
              text
              @click="modalState.show = false"
          >
            Закрыть
          </v-btn>

        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>
import Vue from 'vue';
import {SchedulePlugin, Week,} from '@syncfusion/ej2-vue-schedule';
import {loadCldr} from '@syncfusion/ej2-base';


loadCldr(
    require('cldr-data/supplemental/numberingSystems.json'),
    require('cldr-data/main/ru/ca-gregorian.json'),
    require('cldr-data/main/ru/numbers.json'),
    require('cldr-data/main/ru/timeZoneNames.json')
);
Vue.use(SchedulePlugin);

var majorTemplateVue = Vue.component('majorTimeLine', {
  template: '<div style="display: flex; justify-content: space-between; padding-left: 10px ; padding-right: 10px ;align-items: center"><img alt="Avatar" style="width: 30px; border-radius: 50px" :src="getPhoto(data.date)" > <span style="font-size: 14px;">{{getName(data.date)}}</span></div>',
  data: function () {
    return {
      data: {}
    };
  },

  methods: {
    getPhoto: function (date) {
      return this.$store.state.data.MASTERS[date.getHours() * 60 + date.getMinutes()]?.AVATAR;
    },
    getName: function (date) {
      let elem = this.$store.state.data.MASTERS[date.getHours() * 60 + date.getMinutes()];
      return elem?.NAME + " " + elem?.LAST_NAME;
    }
  }
});

var eventTemplateVue = Vue.component('eventTemplate', {
  template: `
    <div class='template-wrap'>
    <div class='subject'><b>{{ $store.getters.getSalonByID(data.SALON_ID).NAME }}</b></div>
    <div class='time'>
      {{ getAssistName(data.ASSISTANT_ID) }}
    </div>
    </div>`,
  data() {
    return {
      data: {},
    };
  },
  methods: {
    getAssistName(ID) {
      if (ID) {
        return this.$store.getters.getAssistantByID(this.data.ASSISTANT_ID).NAME + " " + this.$store.getters.getAssistantByID(this.data.ASSISTANT_ID).LAST_NAME
      } else return ''
    }

  }

});


export default {
  name: 'app',
  provide: {
    schedule: [Week]
  },
  components: {},
  data() {
    return {
      isInit: false,
      isEditable: false,
      curElem: {},
      modalState: {
        show: false,
        MASTER: {},
      },
      startHour: '00:00',
      endHour: '00:05',
      timeScale: {
        enable: true,
        interval: 1,
        slotCount: 1
      },
      majorSlotTemplate: function (e) {
        return {template: majorTemplateVue}
      },

      eventSettings: {
        template: function (e) {
          return {
            template: eventTemplateVue
          };
        },
        dataSource: undefined
      }
    }
  },

  methods: {
    async deleteElem() {
      if (await this.$store.dispatch('deleteEvent', this.curElem.ID)) {
        this.$refs.schedule.deleteEvent(this.curElem.ID);
        this.$store.commit("deleteElem", this.curElem.ID);
        let index = this.eventSettings.dataSource.indexOf(this.eventSettings.dataSource.find(elem => elem.Id === this.curElem.ID));
        this.modalState = {};
        this.modalState.show = false;
        if (index > -1) {
          this.eventSettings.dataSource.splice(index, 1);
        }
      }
    },
    async saveElem() {
      let payload = {
        DATE: this.curElem.DATE.getFullYear()+"-"+(1+this.curElem.DATE.getMonth())+"-"+this.curElem.DATE.getDate()+'T00:00:00.000Z',
        MASTER_ID: this.curElem.MASTER_ID,
        SALON_ID: this.curElem.SALON_ID,
        ASSISTANT_ID:  this.curElem.ASSISTANT_ID!='0'? this.curElem.ASSISTANT_ID:'',
      }

      let id = await this.$store.dispatch('addEvent', payload);
      if (id) {
        payload.Id = id;
        payload.ID = id;
        payload.Subject = id;
        payload.StartTime = new Date(this.curElem.DATE);
        payload.EndTime = new Date(this.curElem.DATE.getTime() + 60000)
        this.$refs.schedule.addEvent(payload);
        this.$store.commit("addElem", payload);
        this.modalState = {}
        this.modalState.show = false;
      }
    },
    async updateElem() {

      let payload = {
        ID: this.curElem.ID,
        DATE: this.curElem.DATE.getFullYear()+"-"+(1+this.curElem.DATE.getMonth())+"-"+this.curElem.DATE.getDate()+'T00:00:00.000Z',
        MASTER_ID: this.curElem.MASTER_ID,
        SALON_ID: this.curElem.SALON_ID,
        ASSISTANT_ID: this.curElem.ASSISTANT_ID!='0'? this.curElem.ASSISTANT_ID:'',
      }
      let result = await this.$store.dispatch('updateEvent', payload);
      if (result) {
        this.$refs.schedule.deleteEvent(this.curElem.ID);
        this.$store.commit("deleteElem", this.curElem.ID);
        let index = this.eventSettings.dataSource.indexOf(this.eventSettings.dataSource.find(elem => elem.Id === this.curElem.ID));
        if (index > -1) {
          this.eventSettings.dataSource.splice(index, 1);
        }
        payload.Id = this.curElem.ID;
        payload.ID = this.curElem.ID;
        payload.Subject = this.curElem.ID;
        payload.StartTime = new Date(this.curElem.DATE);
        payload.EndTime = new Date(this.curElem.DATE.getTime() + 60000)
        this.$refs.schedule.addEvent(payload);
        this.$store.commit("addElem", payload);
        this.modalState = {}
        this.modalState.show = false;
      }
    },
    onCellClick(event) {
      this.curElem = {}
      let start = new Date(event.startTime);
      if (!event.isAllDay && !this.eventSettings.dataSource.find((el) => new Date(el.StartTime).toString() === start.toString())) {
        this.curElem = {};
        let index = start.getHours() * 60 + start.getMinutes();
        this.curElem.MASTER_ID = this.$store.state.data.MASTERS[index].ID
        this.curElem.DATE = start
        this.modalState = {
          show: true,
          title: "Добавить",
          ASSISTANTS: this.$store.getters.getFreeAssistant(start),
          SALONS: this.$store.getters.getFreeSalons(start),
          MASTER: this.$store.state.data.MASTERS[index],
          date: start
        };
      }
    },
    onEventClick(ev) {
      this.curElem = {
        DATE: ev.event.StartTime,
        ID: ev.event.ID,
        ASSISTANT_ID: ev.event.ASSISTANT_ID,
        SALON_ID: ev.event.SALON_ID,
        MASTER_ID: ev.event.MASTER_ID,
      }

      let assistants = ev.event.ASSISTANT_ID ? [this.$store.getters.getAssistantByID(ev.event.ASSISTANT_ID)].concat(this.$store.getters.getFreeAssistant(ev.event.StartTime)) : this.$store.getters.getFreeAssistant(ev.event.StartTime);

      this.modalState = {
        show: true,
        title: "Подробности",
        ASSISTANTS: assistants,
        SALONS: [this.$store.getters.getSalonByID(ev.event.SALON_ID)].concat(this.$store.getters.getFreeSalons(ev.event.StartTime)),
        MASTER: this.$store.getters.getMasterByID(ev.event.MASTER_ID),
        date: ev.event.StartTime
      };
    },
    onPopupOpen: function (args) {
      args.cancel = true;
      return args

    },
    calcHourView(index) {

      let hours = Math.floor(index / 60);
      let minutes = index % 60;
      return `${hours}:${minutes}`;
    }
  },

  mounted: async function () {
    this.$store.dispatch('fetchData').then(() => {
      this.endHour = this.calcHourView(this.$store.state.data.MASTERS.length)
      this.eventSettings.dataSource = this.$store.state.data.SCHEDULE
      this.isEditable = this.$store.state.data.EDIT_RIGHTS
      this.isInit = true;
    }).then(() => {
      Array.from(document.getElementsByClassName('e-tbar-btn-text')).find((el) => el.textContent === 'Today').textContent = "Сегодня";
      let scheduleObj = document.getElementById('Schedule').ej2_instances[0];
      scheduleObj.timeScale.majorSlotTemplate = this.majorSlotTemplate;
      scheduleObj.dataBind();
    });


  }


}

</script>

<style lang="scss">
.e-time-cells {
  white-space: normal !important;
}
</style>
