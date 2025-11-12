<template>
  <q-dialog
    v-model="showSendDialog"
    position="bottom"
    :maximized="$q.screen.lt.sm"
    transition-show="slide-up"
    transition-hide="slide-down"
    backdrop-filter="blur(2px) brightness(60%)"
  >
    <q-card class="bg-grey-10 text-white full-width-card q-pb-lg">
      <q-card-section class="row items-center q-pb-sm">
        <q-btn flat round dense v-close-popup class="q-ml-sm" color="primary">
          <XIcon />
        </q-btn>
        <div class="col text-center">
          <span class="text-h6">{{ $t("SendDialog.title") }}</span>
        </div>
        <q-btn
          flat
          round
          dense
          class="q-mr-sm"
          @click="showCamera"
          color="primary"
        >
          <ScanIcon />
        </q-btn>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="q-gutter-y-md">
          <q-btn class="full-width custom-btn" @click="showSendTokensDialog">
            <div class="row items-center full-width">
              <div class="icon-background q-mr-md">
                <CoinsIcon />
              </div>
              <div class="text-left">
                <div class="text-weight-bold custom-btn-text">
                  {{ $t("SendDialog.actions.ecash.label") }}
                </div>
              </div>
            </div>
          </q-btn>

          <q-btn class="full-width custom-btn" @click="showParseDialog">
            <div class="row items-center full-width">
              <div class="icon-background q-mr-md">
                <ZapIcon />
              </div>
              <div class="text-left">
                <div class="text-weight-bold custom-btn-text">
                  {{ $t("SendDialog.actions.lightning.label") }}
                </div>
              </div>
            </div>
          </q-btn>

          <q-btn class="full-width custom-btn" @click="showContactsDialog">
            <div class="row items-center full-width">
              <div class="icon-background q-mr-md">
                <ContactIcon />
              </div>
              <div class="text-left">
                <div class="text-weight-bold custom-btn-text">
                  {{ $t("SendDialog.actions.contacts.label") }}
                </div>
              </div>
            </div>
          </q-btn>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- New Contacts Dialog -->
  <q-dialog
    v-model="showContactsDialog"
    position="bottom"
    :maximized="$q.screen.lt.sm"
    transition-show="slide-up"
    transition-hide="slide-down"
    backdrop-filter="blur(2px) brightness(60%)"
  >
    <q-card class="bg-grey-10 text-white full-width-card q-pb-lg">
      <q-card-section class="row items-center q-pb-sm">
        <q-btn flat round dense v-close-popup class="q-ml-sm" color="primary">
          <XIcon />
        </q-btn>
        <div class="col text-center">
          <span class="text-h6">Contacts</span>
        </div>
        <q-space />
      </q-card-section>
      <q-card-section class="q-pa-md">
        <q-list bordered>
          <q-item
            clickable
            v-ripple
            v-for="contact in contacts"
            :key="contact.name"
            @click="selectContact(contact)"
          >
            <q-item-section>
              <q-item-label>{{ contact.name }}</q-item-label>
              <q-item-label caption>{{ contact.address }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <q-btn
          color="primary"
          label="Add Contact"
          @click="showAddContactDialog"
          class="full-width q-mt-md"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useUiStore } from "src/stores/ui";
import { useWalletStore } from "src/stores/wallet";
import { useCameraStore } from "src/stores/camera";
import { useSendTokensStore } from "src/stores/sendTokensStore";
import { useSettingsStore } from "../stores/settings";
import { useMintsStore } from "src/stores/mints";
import { useContactsStore } from "src/stores/contacts"; // New import
import {
  X as XIcon,
  Banknote as BanknoteIcon,
  Zap as ZapIcon,
  Scan as ScanIcon,
  Coins as CoinsIcon,
  User as ContactIcon, // New icon (adjust if needed)
} from "lucide-vue-next";
import { notifyWarning } from "src/js/notify";

export default defineComponent({
  name: "SendDialog",
  components: {
    XIcon,
    CoinsIcon,
    ZapIcon,
    ScanIcon,
    ContactIcon, // Add new icon
  },
  mixins: [windowMixin],
  props: {},
  data: function () {
    return {
      currentPage: 1,
      pageSize: 5,
      showContactsDialog: false, // New variable to control contacts dialog
    };
  },
  computed: {
    ...mapState(useMintsStore, ["mints"]),
    ...mapWritableState(useUiStore, [
      "showInvoiceDetails",
      "tab",
      "showSendDialog",
      "showReceiveDialog",
    ]),
    ...mapWritableState(useWalletStore, [
      "invoiceHistory",
      "invoiceData",
      "payInvoiceData",
    ]),
    ...mapWritableState(useCameraStore, ["camera"]),
    ...mapWritableState(useSendTokensStore, [
      "showSendTokens",
      "sendData",
      "showLockInput",
    ]),
    ...mapState(useContactsStore, ["contacts"]), // Add contacts from store
    canMakePayments: function () {
      if (!this.mints.length) {
        return false;
      } else {
        return true;
      }
    },
  },
  methods: {
    ...mapActions(useCameraStore, ["closeCamera", "showCamera"]),
    showParseDialog: function () {
      if (!this.canMakePayments) {
        notifyWarning(
          this.$i18n.t("SendDialog.actions.lightning.error_no_mints")
        );
        this.showSendDialog = false;
        return;
      }
      this.payInvoiceData.show = true;
      this.payInvoiceData.invoice = null;
      this.payInvoiceData.lnurlpay = null;
      this.payInvoiceData.domain = contact.address; // Set Lightning address
      this.payInvoiceData.lnurlauth = null;
      this.payInvoiceData.input.request = contact.address; // Fill input field
      this.payInvoiceData.input.comment = "";
      this.camera.show = false;
      this.showSendDialog = false;
    },
    showSendTokensDialog: function () {
      console.log("##### showSendTokensDialog");
      if (!this.canMakePayments) {
        notifyWarning(this.$i18n.t("SendDialog.actions.ecash.error_no_mints"));
        this.showSendDialog = false;
        return;
      }
      this.sendData.tokens = "";
      this.sendData.tokensBase64 = "";
      this.sendData.amount = null;
      this.sendData.memo = "";
      this.sendData.p2pkPubkey = "";
      this.sendData.paymentRequest = undefined;
      this.showSendDialog = false;
      this.showSendTokens = true;
      this.showLockInput = false;
    },
  },
  created: function () {},
});
</script>

<style lang="scss" scoped>
.q-dialog__inner > div {
  border-top-left-radius: 20px !important;
  border-top-right-radius: 20px !important;
  border-bottom-left-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
}

.icon-background {
  background-color: $grey-10;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lucide {
  width: 24px;
  height: 24px;
}
</style>
