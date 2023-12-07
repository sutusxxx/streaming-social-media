import { Router } from "@angular/router";
import { PATH } from "../constants/path.constant";

export class RouterHelper {
    static navigateToUserProfile(userId: string, router: Router): void {
        router.navigate([PATH.PROFILE], { queryParams: { id: userId } });
    }
}