import {createRealmContext} from '@realm/react';
import {User} from '../realm/models.ts';

export const realmContext = createRealmContext({
        schema: [User],
});