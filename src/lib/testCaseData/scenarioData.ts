export const scenarioTemplates = [
  // Binary Search Tree scenarios
  {
    scenarioId: "bst_duplicate_handling",
    overview: "Student fails to handle duplicate values in BST insertion, using 'else if' instead of 'else' for the final condition",
    taskDescription: "Implement BST node insertion maintaining the binary search tree property. Insert values following the rule: left < root < right",
    studentCode: `class BinarySearchTreeInsertion {
    public static TreeNode insertNode(TreeNode root, int val) {
        if (root == null) {
            return new TreeNode(val);
        }
        if (val < root.val) {
            root.left = insertNode(root.left, val);
        }
        else if (val > root.val) {
        // TODO: If val equals root.val, don't insert duplicates (just return root)
        root.right = insertNode(root.right, val);
        }
        return root;
    }
}`,
    executionOutput: "❌ Test failed - Incorrect postorder traversal sequence"
  },
  
  {
    scenarioId: "bst_return_type_mismatch",
    overview: "Student declares methods that return TreeNode but attempts to return int values (root.val) instead of nodes",
    taskDescription: "Implement two functions to find the smallest and largest values in a BST. Use the BST property to traverse efficiently.",
    studentCode: `class BinarySearchTree {
    public static TreeNode findMin(TreeNode root) {
        if (root==null) {
            return root;
        }
        else if (root.left == null) {
            return root.val;
        }
        return findMin(root.left);
    }
    
    public static TreeNode findMax(TreeNode root) {
        if (root==null) {
            return root;
        }
        else if (root.right == null) {
            return root.val;
        }
        return findMin(root.right);
    }
}`,
    executionOutput: "❌ Compilation failed: 29: Error: incompatible types: int cannot be converted to TreeNode return root.val;"
  },

  {
    scenarioId: "bst_method_call_syntax",
    overview: "Student incorrectly calls root.left() and root.right() as methods with parentheses instead of accessing fields directly",
    taskDescription: "Implement two functions to find the smallest and largest values in a BST. Use the BST property to traverse efficiently.",
    studentCode: `class BinarySearchTree {
    public static TreeNode findMin(TreeNode root) {
        if (root == null) {
            return null;
        }
        while (root.left != null) {
            root = root.left();
        }
        return root;
    }
    
    public static TreeNode findMax(TreeNode root) {
        if (root == null) {
            return null;
        }
        while (root.right != null) {
            root = root.right();
        }
        return root;
    }
}`,
    executionOutput: "❌ Runtime Error: Segmentation Fault Your code attempted to access invalid memory. This might be due to: • Null pointer access • Array index out of bounds • Stack overflow"
  },

  {
    scenarioId: "bst_traversal_output_format",
    overview: "Student prints the entire TreeNode object instead of just the value, causing output mismatch with expected sorted integers",
    taskDescription: "Implement in-order traversal that prints BST values in sorted order. Follow Left → Root → Right pattern.",
    studentCode: `class BinarySearchTreeTraversal {
    public static void inOrderTraversal(TreeNode root) {
        if (root == null){
            return;
        }
        inOrderTraversal(root.left);
        System.out.println(root);
        inOrderTraversal(root.right);
    }
}`,
    executionOutput: "❌ Test failed - output mismatch"
  },

  // Graph Algorithm scenarios
  {
    scenarioId: "dfs_missing_implementation",
    overview: "Student has empty method bodies for DFS implementation, missing both the recursive helper and public method logic",
    taskDescription: "Complete the two missing methods: the private recursive helper function DFSUtil and the public DFS method that initiates the traversal",
    studentCode: `public class DFSGraphTraversal {
    private int V;
    private LinkedList<Integer>[] adj;
    private boolean[] visited;

    private void DFSUtil(int v) {
        // TODO: Your code here.
    }
    
    public void DFS(int s) {
        // TODO: Your code here.
    }
}`,
    executionOutput: "❌ Compilation failed: Method body expected for DFSUtil and DFS methods"
  },

  {
    scenarioId: "dfs_infinite_recursion",
    overview: "Student implements DFS without checking if neighbors are already visited, causing infinite recursion in cyclic graphs",
    taskDescription: "Complete the two missing methods: the private recursive helper function DFSUtil and the public DFS method that initiates the traversal",
    studentCode: `public class DFSGraphTraversal {
    private void DFSUtil(int v) {
        System.out.print(v + " ");
        for (int nbr : adj[v]) {
            DFSUtil(nbr); // Missing visited check
        }
    }
    
    public void DFS(int s) {
        for (int i = 0; i < V; i++) visited[i] = false;
        DFSUtil(s);
    }
}`,
    executionOutput: "❌ Runtime Error: Stack Overflow Exception - Infinite recursion detected"
  },

  {
    scenarioId: "dfs_visited_not_reset",
    overview: "Student forgets to reset the visited array before starting DFS, causing incomplete traversals on subsequent calls",
    taskDescription: "Complete the two missing methods: the private recursive helper function DFSUtil and the public DFS method that initiates the traversal",
    studentCode: `public class DFSGraphTraversal {
    private void DFSUtil(int v) {
        visited[v] = true;
        System.out.print(v + " ");
        for (int nbr : adj[v]) {
            if (!visited[nbr]) {
                DFSUtil(nbr);
            }
        }
    }
    
    public void DFS(int s) {
        // Missing visited array reset
        DFSUtil(s);
    }
}`,
    executionOutput: "❌ Test failed - Subsequent DFS calls return incomplete traversals"
  },

  {
    scenarioId: "dijkstra_infinity_handling",
    overview: "Student fails to check if minVertex() returns -1, causing null pointer exception when no unvisited vertices remain",
    taskDescription: "Implement Dijkstra's algorithm to find the shortest paths from a starting vertex to all other vertices in a weighted graph.",
    studentCode: `public class Dijkstra {
    public void runDijkstra(int startVertex) {
        Arrays.fill(distances, INFINITY);
        distances[startVertex] = 0;
        
        for (int i = 0; i < numVertices; i++) {
            int u = minVertex();
            visited[u] = true; // Missing null check
            
            for (int v = 0; v < numVertices; v++) {
                int w = adjacencyMatrix[u][v];
                if (!visited[v] && w > 0) {
                    distances[v] = distances[u] + w; // Missing minimum comparison
                }
            }
        }
    }
}`,
    executionOutput: "❌ Runtime Error: NullPointerException at visited[u] = true"
  },

  {
    scenarioId: "dijkstra_distance_update_logic",
    overview: "Student always overwrites distances without comparing for minimum, violating Dijkstra's shortest path principle",
    taskDescription: "Implement Dijkstra's algorithm to find the shortest paths from a starting vertex to all other vertices in a weighted graph.",
    studentCode: `public class Dijkstra {
    public void runDijkstra(int startVertex) {
        Arrays.fill(distances, INFINITY);
        distances[startVertex] = 0;
        
        for (int i = 0; i < numVertices; i++) {
            int u = minVertex();
            if (u == -1) break;
            visited[u] = true;
            
            for (int v = 0; v < numVertices; v++) {
                int w = adjacencyMatrix[u][v];
                if (!visited[v] && w > 0) {
                    distances[v] = distances[u] + w; // Always overwrites, doesn't check for minimum
                }
            }
        }
    }
}`,
    executionOutput: "❌ Test failed - Incorrect shortest path distances calculated"
  },

  {
    scenarioId: "kruskal_union_find_missing",
    overview: "Student sorts edges correctly but fails to implement Union-Find cycle detection, creating invalid MSTs with cycles",
    taskDescription: "Implement Kruskal algorithm using Union-Find to build a minimum spanning tree and find the minimum weight edge.",
    studentCode: `public class KruskalMST {
    public void kruskalMST() {
        Collections.sort(edges);
        List<Edge> mst = new ArrayList<>();
        
        for (Edge edge : edges) {
            // TODO: Implement Union-Find logic to detect cycles
            mst.add(edge);
        }
    }
}`,
    executionOutput: "❌ Test failed - MST contains cycles, incorrect total weight"
  },

  {
    scenarioId: "kruskal_edge_sorting_missing",
    overview: "Student implements Union-Find correctly but forgets to sort edges by weight, producing incorrect MST with wrong total cost",
    taskDescription: "Implement Kruskal algorithm using Union-Find to build a minimum spanning tree and find the minimum weight edge.",
    studentCode: `public class KruskalMST {
    public void kruskalMST() {
        // Missing edge sorting by weight
        List<Edge> mst = new ArrayList<>();
        UnionFind uf = new UnionFind(numVertices);
        
        for (Edge edge : edges) {
            if (!uf.connected(edge.src, edge.dest)) {
                uf.union(edge.src, edge.dest);
                mst.add(edge);
            }
        }
    }
}`,
    executionOutput: "❌ Test failed - MST total weight incorrect, not minimum spanning tree"
  },

  // Hash Table scenarios
  {
    scenarioId: "hash_function_incomplete_implementation",
    overview: "Student calls Math.pow() without providing required parameters, causing compilation failure in string fold hash function",
    taskDescription: "Create a string fold hash function that processes strings four bytes at a time, treating each chunk as a long integer and summing them.",
    studentCode: `public class StringHasher {
    public static int sfold(String s, int M) {
        int power = 0;
        long hash = 0;
        char[] str = s.toCharArray();
        for (int i = 0; i < str.length; i++){
            power = i % 4;
            hash += Math.pow(); // Missing parameters
        }
        return 0;
    }
}`,
    executionOutput: "❌ Compilation failed: The method pow() in the type Math is not applicable for the given arguments"
  },

  {
    scenarioId: "hash_function_wrong_multiplication",
    overview: "Student uses incorrect multiplication factor (character * index) instead of proper 256^power folding algorithm",
    taskDescription: "Create a string fold hash function that processes strings four bytes at a time, treating each chunk as a long integer and summing them.",
    studentCode: `public class StringHasher {
    public static int sfold(String s, int M) {
        long hash = 0;
        char[] str = s.toCharArray();
        for (int i = 0; i < str.length; i++){
            hash += str[i] * i; // Wrong multiplication factor
        }
        return (int)(hash % M);
    }
}`,
    executionOutput: "❌ Test failed - Hash index: 42, Expected: 75"
  },

  {
    scenarioId: "linear_probing_infinite_loop",
    overview: "Student uses wrong loop variable (i instead of curr) and missing index update logic, causing infinite loop in insertion",
    taskDescription: "Implement a closed hash table using linear probing with tombstone support for proper deletion handling.",
    studentCode: `public class LinearProbingHash {
    public void insert(int key) {
        int insertionIndex;
        for (int curr = hashFunc(key); hashTable[curr] != -1 && hashTable[curr] != -2; i++){ // Wrong variable
            // Missing index update logic
        }
    }
}`,
    executionOutput: "❌ Runtime Error: Infinite loop detected in insert method"
  },

  {
    scenarioId: "linear_probing_missing_search_logic",
    overview: "Student only checks the home position for search, failing to implement linear probing sequence for collision resolution",
    taskDescription: "Implement a closed hash table using linear probing with tombstone support for proper deletion handling.",
    studentCode: `public class LinearProbingHash {
    public int search(int key) {
        int home = hashFunc(key);
        if (hashTable[home] == key) {
            return home;
        }
        return -1; // Doesn't handle linear probing
    }
}`,
    executionOutput: "❌ Test failed - Search 35: Not found, Expected: Found at index 7"
  },

  {
    scenarioId: "quadratic_probing_modulo_missing",
    overview: "Student calculates quadratic probe sequence but forgets modulo operation, causing array index out of bounds errors",
    taskDescription: "Implement quadratic probing collision resolution using the formula (hash + i²) % size.",
    studentCode: `public class QuadraticProbing {
    public void insert(int key) {
        int home = hashFunc(key);
        int insertIndex = home;
        for (int i = 0; hashTable[insertIndex] >= 0; i++){
            insertIndex = home + (int)Math.pow(i, 2); // Missing modulo operation
        }
        hashTable[insertIndex] = key;
    }
}`,
    executionOutput: "❌ Runtime Error: ArrayIndexOutOfBoundsException: Index 15 out of bounds for length 11"
  },

  {
    scenarioId: "quadratic_probing_search_logic_error",
    overview: "Student implements quadratic probing search but forgets modulo operation, matching the same error as insertion method",
    taskDescription: "Implement quadratic probing collision resolution using the formula (hash + i²) % size.",
    studentCode: `public class QuadraticProbing {
    public int search(int key) {
        int home = hashFunc(key);
        int target = home;
        for (int i = 0; hashTable[target] != -1; i++) {
            if (hashTable[target] == key){
                return target;
            }
            target = home + (int)Math.pow(i, 2); // Missing modulo, same as insert
        }
        return -1;
    }
}`,
    executionOutput: "❌ Runtime Error: ArrayIndexOutOfBoundsException during search operation"
  },

  {
    scenarioId: "hash_table_tombstone_handling",
    overview: "Student uses EMPTY_SLOT instead of TOMBSTONE for deletion, breaking probe sequence and causing subsequent search failures",
    taskDescription: "Implement a closed hash table using linear probing with tombstone support for proper deletion handling.",
    studentCode: `public class LinearProbingHash {
    public void delete(int key) {
        int index = search(key);
        if (index != -1) {
            hashTable[index] = EMPTY_SLOT; // Should use TOMBSTONE
        }
    }
}`,
    executionOutput: "❌ Test failed - Subsequent searches fail after deletion due to broken probe sequence"
  },

  {
    scenarioId: "hash_negative_handling",
    overview: "Student forgets to use Math.abs() on hash result, causing negative indices that don't map to valid array positions",
    taskDescription: "Create a string fold hash function that processes strings four bytes at a time, treating each chunk as a long integer and summing them.",
    studentCode: `public class StringHasher {
    public static int sfold(String s, int M) {
        long hash = 0;
        for (int i = 0; i < s.length(); i++) {
            int power = i % 4;
            hash += s.charAt(i) * Math.pow(256, power);
        }
        return (int)(hash % M); // Missing Math.abs() for negative hash
    }
}`,
    executionOutput: "❌ Test failed - Hash index: -26, Expected positive index"
  }
];