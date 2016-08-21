(function () {

    'use strict';
    angular
        .module('app')
        .constant("APP_CONST", appconstants());

    function appconstants() {
        var C = {
            N_T: {
                RAILYARD: "BulkRailyard",
                INBOUND: "BulkInbound",
                OUTBOUND: "BulkOutbound",
                TRANSLOAD: "BulkTransload",
                TERMINAL: "BulkTerminal",
                PRODUCT: "BulkProduct"
            },
            LOCAL_STORAGE: {
                USER_NAME: "currentUser",
                USER_TYPE: "login-userType",
                USER_GROUP_KEY: "sync-user-group-key"
            },
            CONFIG: {
                UN_NUMBERS: "data_lookup_un_numbers",
                OUTBOUND_REQUIRE_TOP_SEALS : "outbound_require_top_seals"
            },
            AREA: {
                TOP: 'top',
                BOTTOM: 'bottom'
            },
            ALL_AREAS: ['top', 'bottom'],
            COMPARTMENT: {
                A: 'A',
                AC: 'AC',
                C: 'C',
                BC: 'BC',
                B: 'B'
            },
            ALL_COMPARTMENTS: ['A', 'AC', 'C', 'BC', 'B'],
            INSP_STATUS: {
                P: "PENDING",
                IP: "IN PROGRESS",
                C: "COMPLETED"
            },
            SORT_OPT: {
                TRACK_SEQ: "Track/Seq",
                RAIL_CAR: "Rail Car ID",
                INSP_STATUS: "Status"
            },
            ORDER_FILTER_OPT: {
                ME: 'ME',
                ALL: 'ALL'
            },
            ORDER_SORT_OPT:{
                COMMODITY: "Product",
                DELIVERY_DATE: "Delivery Date",
                LOADER: "Loader"
            }
        };

        C.ALL_SORT_OPT = [C.SORT_OPT.TRACK_SEQ, C.SORT_OPT.RAIL_CAR, C.SORT_OPT.INSP_STATUS];

        C.LIST_SORT_MAP = {};
        C.LIST_SORT_MAP[C.SORT_OPT.RAIL_CAR] = 'node.props.carNumber';
        C.LIST_SORT_MAP[C.SORT_OPT.INSP_STATUS] = 'node.props.inspStatus';
        C.LIST_SORT_MAP[C.SORT_OPT.TRACK_SEQ] = 'node.props.defaultSort';

        C.ALL_ORDER_SORT_OPT = [C.ORDER_SORT_OPT.COMMODITY, C.ORDER_SORT_OPT.DELIVERY_DATE, C.ORDER_SORT_OPT.LOADER];
        C.ORDER_SORT_MAP = {};
        C.ORDER_SORT_MAP[C.ORDER_SORT_OPT.COMMODITY] = 'productDisplay';
        C.ORDER_SORT_MAP[C.ORDER_SORT_OPT.DELIVERY_DATE] = 'latestDeliveryDateDisplay';
        C.ORDER_SORT_MAP[C.ORDER_SORT_OPT.LOADER] = 'loaderId';

        return C;
    } // appconstants()

})();