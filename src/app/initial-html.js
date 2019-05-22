/**
 * @format
 * @flow
 */


/*
<!-- wp:list -->
<ul><li>line 1</li><li>line 2</li><li>line 3</li><li>line 4</li><li>line 5</li></ul>
<!-- /wp:list -->

nested:
<!-- wp:list -->
<ul><li>line 1</li><ul><li>line 21</li><li>line 22</li><ul><li>line 31</li><li>line 32</li></ul></ul><li>line 3</li><li>line 4</li><li>line 5</li></ul>
<!-- /wp:list -->

<!-- wp:list -->
<ul><li>line 1</li><li>line 21</li><li>line 22</li><li>line 31</li><li>line 32</li><li>line 3</li><li>line 4</li><li>line 5</li></ul>
<!-- /wp:list -->

*/


export default `
<!-- wp:list -->
<ul><li>line 1<ul><li>line 21</li><li>line 22<ul><li>line 31</li><li>line 32</li></ul></li></ul></li><li>line 3</li><li>line 4</li><li>line 5</li></ul>
<!-- /wp:list -->


`;
