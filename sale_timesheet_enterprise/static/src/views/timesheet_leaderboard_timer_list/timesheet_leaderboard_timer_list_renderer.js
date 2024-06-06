/** @odoo-module **/

import { TimesheetTimerListRenderer } from "@timesheet_grid/views/timesheet_list/timesheet_timer_list_renderer";
import { TimesheetLeaderboard } from "@sale_timesheet_enterprise/components/timesheet_leaderboard/timesheet_leaderboard";

import { patch } from "@web/core/utils/patch";
import { useService } from "@web/core/utils/hooks";
import { onWillStart } from "@odoo/owl";

patch(TimesheetTimerListRenderer, {
    components: {
        ...TimesheetTimerListRenderer.components,
        TimesheetLeaderboard,
    },
});

patch(TimesheetTimerListRenderer.prototype, {
    setup() {
        super.setup()
        this.user = useService('user');
        this.orm = useService('orm');
        onWillStart(this.onWillStart);
    },

    async onWillStart() {
        this.userHasBillingRateGroup = await this.user.hasGroup('sale_timesheet_enterprise.group_timesheet_leaderboard_show_rates');
        const billableTimeTarget = await this.orm.searchRead(
            'hr.employee',
            [['user_id', '=', this.user.userId]],
            ['billable_time_target']
        );
        this.showIndicators = billableTimeTarget[0].billable_time_target > 0;
        this.showLeaderboard = await this.user.hasGroup('sale_timesheet_enterprise.group_use_timesheet_leaderboard');
        this.showLeaderboardComponent = (this.userHasBillingRateGroup && this.showIndicators) || this.showLeaderboard;
    },

    get isMobile() {
        return this.env.isSmall;
    },
});
